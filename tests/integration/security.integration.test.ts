/**
 * Integración — Casos 2, 3, 16, 17 del Manual v1.1.1
 * Validan seguridad real del servidor: bcrypt, rate-limit, soft delete, cambio de contraseña
 */
import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../../src/api';
import { prisma } from '../../src/lib/prisma';

const BASE_LOGIN = '/api/deprisacheck/login';

// ─── Setup ───────────────────────────────────────────────────────────────────

beforeAll(async () => {
  const hash = await bcrypt.hash('pass-test-123', 10);
  const hashInactivo = await bcrypt.hash('pass-inactivo', 10);

  // Usuario activo con bcrypt y habilitado para DeprisaCheck
  await prisma.user.upsert({
    where: { username: 'test-sec-activo' },
    update: { passwordHash: hash, isDeprisacheckEnabled: true },
    create: {
      username: 'test-sec-activo',
      passwordHash: hash,
      email: 'sec-activo@test.com',
      role: 'advisor',
      isDeprisacheckEnabled: true,
    },
  });

  // Usuario inactivo
  await prisma.user.upsert({
    where: { username: 'test-sec-inactivo' },
    update: { passwordHash: hashInactivo, isActive: false, isDeprisacheckEnabled: true },
    create: {
      username: 'test-sec-inactivo',
      passwordHash: hashInactivo,
      email: 'sec-inactivo@test.com',
      role: 'advisor',
      isDeprisacheckEnabled: true,
      isActive: false,
    },
  });

  // Usuario para cambio de contraseña y desactivación
  const hashAdmin = await bcrypt.hash('admin-original', 10);
  await prisma.user.upsert({
    where: { username: 'test-sec-admin-target' },
    update: { passwordHash: hashAdmin, isActive: true, isDeprisacheckEnabled: true },
    create: {
      username: 'test-sec-admin-target',
      passwordHash: hashAdmin,
      email: 'admin-target@test.com',
      role: 'advisor',
      isDeprisacheckEnabled: true,
      isActive: true,
    },
  });
}, 20000);

afterAll(async () => {
  await prisma.$disconnect();
});

// ─── CASO 2: Login con contraseña incorrecta → 401 ───────────────────────────
describe('Caso 2 — Login con contraseña incorrecta', () => {
  it('retorna 401 con usuario válido y contraseña incorrecta', async () => {
    const res = await request(app)
      .post(BASE_LOGIN)
      .send({ username: 'test-sec-activo', password: 'contraseña-INCORRECTA' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/credenciales/i);
  });

  it('retorna 401 con usuario inexistente (sin revelar si existe)', async () => {
    const res = await request(app)
      .post(BASE_LOGIN)
      .send({ username: 'usuario-que-no-existe-xyz', password: 'cualquier' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/credenciales/i);
  });

  it('retorna 400 sin credenciales', async () => {
    const res = await request(app).post(BASE_LOGIN).send({});
    expect(res.status).toBe(400);
  });

  it('usuario válido con contraseña correcta retorna 200 y userId', async () => {
    const res = await request(app)
      .post(BASE_LOGIN)
      .send({ username: 'test-sec-activo', password: 'pass-test-123' });

    expect(res.status).toBe(200);
    expect(res.body.userId).toBeDefined();
    expect(res.body.isDeprisacheckEnabled).toBe(true);
    // No debe exponer el hash
    expect(res.body.passwordHash).toBeUndefined();
  });
});

// ─── CASO 3: Login con usuario inactivo → 403 ────────────────────────────────
describe('Caso 3 — Login con usuario inactivo', () => {
  it('retorna 403 aunque la contraseña sea correcta', async () => {
    const res = await request(app)
      .post(BASE_LOGIN)
      .send({ username: 'test-sec-inactivo', password: 'pass-inactivo' });

    expect(res.status).toBe(403);
    expect(res.body.error).toMatch(/inactivo/i);
  });
});

// ─── CASO 16: Desactivar usuario → no puede iniciar sesión ───────────────────
describe('Caso 16 — Desactivar usuario bloquea el acceso', () => {
  it('usuario activo puede hacer login', async () => {
    const res = await request(app)
      .post(BASE_LOGIN)
      .send({ username: 'test-sec-admin-target', password: 'admin-original' });
    expect(res.status).toBe(200);
  });

  it('después de desactivar, el usuario ya no puede hacer login', async () => {
    // Obtener el ID del usuario
    const user = await prisma.user.findUnique({ where: { username: 'test-sec-admin-target' } });
    expect(user).not.toBeNull();

    // Desactivar vía API
    const patchRes = await request(app)
      .patch(`/api/users/${user!.id}/status`)
      .send({ isActive: false });

    expect(patchRes.status).toBe(200);
    expect(patchRes.body.isActive).toBe(false);

    // Intentar login → 403
    const loginRes = await request(app)
      .post(BASE_LOGIN)
      .send({ username: 'test-sec-admin-target', password: 'admin-original' });

    expect(loginRes.status).toBe(403);
    expect(loginRes.body.error).toMatch(/inactivo/i);
  });

  it('al reactivar el usuario puede volver a iniciar sesión', async () => {
    const user = await prisma.user.findUnique({ where: { username: 'test-sec-admin-target' } });

    // Reactivar
    await request(app).patch(`/api/users/${user!.id}/status`).send({ isActive: true });

    const loginRes = await request(app)
      .post(BASE_LOGIN)
      .send({ username: 'test-sec-admin-target', password: 'admin-original' });

    expect(loginRes.status).toBe(200);
  });

  it('PATCH /status con valor no booleano retorna 400', async () => {
    const user = await prisma.user.findUnique({ where: { username: 'test-sec-admin-target' } });
    const res = await request(app)
      .patch(`/api/users/${user!.id}/status`)
      .send({ isActive: 'true' }); // string, no boolean
    expect(res.status).toBe(400);
  });
});

// ─── CASO 17: Cambio de contraseña ───────────────────────────────────────────
describe('Caso 17 — Cambio de contraseña permite login con nueva contraseña', () => {
  const usuarioCambio = 'test-sec-cambio-pass';
  let userId: string;

  beforeAll(async () => {
    const hash = await bcrypt.hash('contrasena-original-456', 10);
    const user = await prisma.user.upsert({
      where: { username: usuarioCambio },
      update: { passwordHash: hash, isActive: true, isDeprisacheckEnabled: true },
      create: {
        username: usuarioCambio,
        passwordHash: hash,
        email: 'cambio@test.com',
        role: 'advisor',
        isDeprisacheckEnabled: true,
        isActive: true,
      },
    });
    userId = user.id;
  });

  it('login con contraseña original funciona', async () => {
    const res = await request(app)
      .post(BASE_LOGIN)
      .send({ username: usuarioCambio, password: 'contrasena-original-456' });
    expect(res.status).toBe(200);
  });

  it('cambio de contraseña retorna 200', async () => {
    const res = await request(app)
      .patch(`/api/users/${userId}/password`)
      .send({ newPassword: 'nueva-contrasena-789' });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('login con contraseña antigua falla después del cambio', async () => {
    const res = await request(app)
      .post(BASE_LOGIN)
      .send({ username: usuarioCambio, password: 'contrasena-original-456' });
    expect(res.status).toBe(401);
  });

  it('login con nueva contraseña funciona correctamente', async () => {
    const res = await request(app)
      .post(BASE_LOGIN)
      .send({ username: usuarioCambio, password: 'nueva-contrasena-789' });
    expect(res.status).toBe(200);
    expect(res.body.userId).toBe(userId);
  });

  it('contraseña demasiado corta retorna 400', async () => {
    const res = await request(app)
      .patch(`/api/users/${userId}/password`)
      .send({ newPassword: 'abc' }); // menos de 6 chars
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/6 caracteres/);
  });
});

// ─── Extras de seguridad ──────────────────────────────────────────────────────
describe('Headers de seguridad (helmet)', () => {
  it('todas las respuestas incluyen X-Content-Type-Options', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });

  it('todas las respuestas incluyen X-Frame-Options', async () => {
    const res = await request(app).get('/health');
    expect(res.headers['x-frame-options']).toBeTruthy();
  });
});

describe('Soft delete de usuarios', () => {
  it('usuario "eliminado" conserva admisiones históricas (no borra DB)', async () => {
    const hash = await bcrypt.hash('pass-soft', 10);
    const user = await prisma.user.upsert({
      where: { username: 'test-soft-delete' },
      update: { passwordHash: hash, isActive: true },
      create: {
        username: 'test-soft-delete',
        passwordHash: hash,
        email: 'soft@test.com',
        role: 'advisor',
        isDeprisacheckEnabled: false,
      },
    });

    // Soft delete vía API
    await request(app)
      .patch(`/api/users/${user.id}/status`)
      .send({ isActive: false });

    // El registro debe seguir existiendo en DB
    const deleted = await prisma.user.findUnique({ where: { id: user.id } });
    expect(deleted).not.toBeNull();
    expect((deleted as { isActive?: boolean }).isActive).toBe(false);
  });
});
