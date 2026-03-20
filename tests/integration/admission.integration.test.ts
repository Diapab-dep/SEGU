/**
 * Pruebas de integración - Flujos de admisión
 * Tareas 6.2.1 a 6.2.4
 */
import request from 'supertest';
import app from '../../src/api';
import { prisma } from '../../src/lib/prisma';
import { setupIntegrationTests } from '../setup-integration';

const merchantData = (clientId: string, merchandiseTypeId: string) => ({
  clientId,
  merchandiseTypeId,
  description: 'Test',
  weight: 10,
});

beforeAll(async () => {
  await setupIntegrationTests();
}, 15000);

afterAll(async () => {
  await prisma.$disconnect();
});

describe('6.2.1 Flujo admisión mercancía estándar (Ciudad y ATO)', () => {
  it('Ciudad: mercancía estándar retorna pending', async () => {
    const typeEstandar = await prisma.merchandiseTypeCatalog.findUnique({ where: { code: 'ESTANDAR' } });
    if (!typeEstandar) throw new Error('ESTANDAR no encontrado');

    const res = await request(app)
      .post('/api/admission/start')
      .send({
        merchandiseData: merchantData('client-1', typeEstandar.id),
        pointOfSaleId: 'pos-city-1',
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('pending');
    expect(res.body.merchandiseId).toBeDefined();
    expect(res.body.requiresDeprisacheck).toBe(false);
  });

  it('ATO: mercancía estándar retorna pending', async () => {
    const typeEstandar = await prisma.merchandiseTypeCatalog.findUnique({ where: { code: 'ESTANDAR' } });
    if (!typeEstandar) throw new Error('ESTANDAR no encontrado');

    const res = await request(app)
      .post('/api/admission/start')
      .send({
        merchandiseData: merchantData('client-1', typeEstandar.id),
        pointOfSaleId: 'pos-ato-1',
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('pending');
    expect(res.body.requiresDeprisacheck).toBe(false);
  });
});

describe('6.2.2 Flujo admisión mercancía peligrosa Ciudad (manejo permitido/rechazo)', () => {
  it('Ciudad: manejo permitido retorna pending', async () => {
    const typeBaterias = await prisma.merchandiseTypeCatalog.findUnique({ where: { code: 'BATERIAS_LITIO' } });
    if (!typeBaterias) throw new Error('BATERIAS_LITIO no encontrado');

    const res = await request(app)
      .post('/api/admission/start')
      .send({
        merchandiseData: merchantData('client-sin-restriccion', typeBaterias.id),
        pointOfSaleId: 'pos-city-1',
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('pending');
    expect(res.body.rejectionReason).toBeUndefined();
  });

  it('Ciudad: manejo no permitido retorna rejected', async () => {
    const typeBaterias = await prisma.merchandiseTypeCatalog.findUnique({ where: { code: 'BATERIAS_LITIO' } });
    if (!typeBaterias) throw new Error('BATERIAS_LITIO no encontrado');

    const res = await request(app)
      .post('/api/admission/start')
      .send({
        merchandiseData: merchantData('client-sin-restriccion', typeBaterias.id),
        pointOfSaleId: 'pos-city-sin-permiso',
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('rejected');
    expect(res.body.rejectionReason).toContain('Manejo no permitido');
  });
});

describe('6.2.3 Flujo admisión mercancía peligrosa ATO (DeprisaCheck aceptación)', () => {
  it('ATO: sin restricciones retorna requires_deprisacheck', async () => {
    const typeBaterias = await prisma.merchandiseTypeCatalog.findUnique({ where: { code: 'BATERIAS_LITIO' } });
    if (!typeBaterias) throw new Error('BATERIAS_LITIO no encontrado');

    const res = await request(app)
      .post('/api/admission/start')
      .send({
        merchandiseData: merchantData('client-sin-restriccion', typeBaterias.id),
        pointOfSaleId: 'pos-ato-1',
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('requires_deprisacheck');
    expect(res.body.requiresDeprisacheck).toBe(true);
  });
});

describe('6.2.4 Flujo rechazo por restricciones y usuarios no habilitados', () => {
  it('ATO: rechazo por restricción de cliente', async () => {
    const typeBaterias = await prisma.merchandiseTypeCatalog.findUnique({ where: { code: 'BATERIAS_LITIO' } });
    if (!typeBaterias) throw new Error('BATERIAS_LITIO no encontrado');

    const res = await request(app)
      .post('/api/admission/start')
      .send({
        merchandiseData: merchantData('client-1', typeBaterias.id),
        pointOfSaleId: 'pos-ato-1',
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('rejected');
    expect(res.body.rejectionReason).toContain('Restricción');
  });

  it('ATO: rechazo por no hay usuarios DeprisaCheck', async () => {
    const typeBaterias = await prisma.merchandiseTypeCatalog.findUnique({ where: { code: 'BATERIAS_LITIO' } });
    if (!typeBaterias) throw new Error('BATERIAS_LITIO no encontrado');

    const res = await request(app)
      .post('/api/admission/start')
      .send({
        merchandiseData: merchantData('client-sin-restriccion', typeBaterias.id),
        pointOfSaleId: 'pos-ato-sin-users',
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('rejected');
    expect(res.body.rejectionReason).toContain('usuarios habilitados');
  });
});
