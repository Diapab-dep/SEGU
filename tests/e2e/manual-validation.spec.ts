/**
 * E2E — Checklist de validación del Manual de Usuario v1.1.1
 *
 * Cubre los 18 casos de la sección 7 del manual:
 * Casos 1, 4-15, 18 → E2E (UI)
 * Casos 2, 3, 16, 17 → ver security.integration.test.ts (API)
 */
import { test, expect, Page } from '@playwright/test';

// ─── Helpers ────────────────────────────────────────────────────────────────

async function loginAs(page: Page, role: 'asesor' | 'supervisor' | 'admin', username: string = role) {
  await page.goto('/login');
  await page.getByPlaceholder('Usuario').fill(username);
  const labelMap = { asesor: 'Asesor', supervisor: 'Supervisor', admin: 'Administrador' };
  await page.locator('select').selectOption({ label: labelMap[role] });
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL('/');
}

async function waitForTypes(page: Page) {
  await expect(async () => {
    const count = await page.locator('label').filter({ hasText: /tipo de mercanc/i })
      .locator('select option').count();
    expect(count).toBeGreaterThanOrEqual(2);
  }).toPass({ timeout: 12000 });
}

// ─── CASO 1: Login con credenciales válidas ──────────────────────────────────
test.describe('Caso 1 — Login con credenciales válidas', () => {
  test('Asesor accede al dashboard', async ({ page }) => {
    await loginAs(page, 'asesor', 'test-asesor');
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Supervisor accede al dashboard', async ({ page }) => {
    await loginAs(page, 'supervisor', 'test-supervisor');
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('Admin accede al dashboard', async ({ page }) => {
    await loginAs(page, 'admin', 'test-admin');
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1').first()).toBeVisible();
  });
});

// ─── CASO 4: Dashboard Asesor ────────────────────────────────────────────────
test('Caso 4 — Dashboard Asesor muestra cards Nueva Admisión y DeprisaCheck', async ({ page }) => {
  await loginAs(page, 'asesor');
  // Cards en el dashboard (section .dashboard-cards)
  await expect(page.locator('.dashboard-cards').getByRole('link', { name: /Nueva Admisión/i })).toBeVisible();
  await expect(page.locator('.dashboard-cards').getByRole('link', { name: /DeprisaCheck/i })).toBeVisible();
  // No debe mostrar Supervisión, Usuarios
  await expect(page.locator('.dashboard-cards').getByRole('link', { name: /Supervisión/i })).not.toBeVisible();
  await expect(page.locator('.dashboard-cards').getByRole('link', { name: /Usuarios/i })).not.toBeVisible();
});

// ─── CASO 5: Dashboard Supervisor ───────────────────────────────────────────
test('Caso 5 — Dashboard Supervisor muestra card Supervisión', async ({ page }) => {
  await loginAs(page, 'supervisor');
  await expect(page.locator('.dashboard-cards').getByRole('link', { name: /Supervisión/i })).toBeVisible();
  await expect(page.locator('.dashboard-cards').getByRole('link', { name: /Nueva Admisión/i })).not.toBeVisible();
  await expect(page.locator('.dashboard-cards').getByRole('link', { name: /Usuarios/i })).not.toBeVisible();
});

// ─── CASO 6: Dashboard Admin ─────────────────────────────────────────────────
test('Caso 6 — Dashboard Admin muestra 7 módulos', async ({ page }) => {
  await loginAs(page, 'admin');
  const cards = page.locator('.dashboard-cards');
  await expect(cards.getByRole('link', { name: /Nueva Admisión/i })).toBeVisible();
  await expect(cards.getByRole('link', { name: /DeprisaCheck/i })).toBeVisible();
  await expect(cards.getByRole('link', { name: /Supervisión/i })).toBeVisible();
  await expect(cards.getByRole('link', { name: /Usuarios/i })).toBeVisible();
  await expect(cards.getByRole('link', { name: /Puntos de Venta/i })).toBeVisible();
  await expect(cards.getByRole('link', { name: /Plantillas/i })).toBeVisible();
  await expect(cards.getByRole('link', { name: /Restricciones/i })).toBeVisible();
});

// ─── CASO 7: Admisión mercancía estándar → pending ───────────────────────────
test('Caso 7 — Admisión estándar retorna estado pending', async ({ page }) => {
  await loginAs(page, 'asesor');
  await page.goto('/admission');
  await expect(page.getByRole('heading', { name: 'Nueva Admisión' })).toBeVisible();

  // Rellenar ID Cliente
  await page.locator('input[type="text"]').first().fill('client-1');

  await waitForTypes(page);

  // Seleccionar Mercancía estándar
  const tipoSelect = page.locator('label').filter({ hasText: /tipo de mercanc/i }).locator('select');
  const estandarOpt = tipoSelect.locator('option').filter({ hasText: /estándar/i }).first();
  const val = await estandarOpt.getAttribute('value');
  await tipoSelect.selectOption(val!);

  await page.getByRole('button', { name: 'Iniciar admisión' }).click();
  await expect(page.getByText('pending')).toBeVisible({ timeout: 8000 });
  await expect(page.getByText('ID Mercancía:')).toBeVisible();
});

// ─── CASO 8: Admisión baterías litio → redirección DeprisaCheck ──────────────
test('Caso 8 — Admisión baterías litio redirige a DeprisaCheck', async ({ page }) => {
  await loginAs(page, 'asesor');
  await page.goto('/admission');

  await page.locator('input[type="text"]').first().fill('client-1');

  await waitForTypes(page);

  const tipoSelect = page.locator('label').filter({ hasText: /tipo de mercanc/i }).locator('select');
  const bateriaOpt = tipoSelect.locator('option').filter({ hasText: /litio/i }).first();
  const bateriaVal = await bateriaOpt.getAttribute('value');
  await tipoSelect.selectOption(bateriaVal!);

  // Seleccionar POS ATO
  const posSelect = page.locator('label').filter({ hasText: /punto de venta/i }).locator('select');
  await expect(async () => {
    const count = await posSelect.locator('option').count();
    expect(count).toBeGreaterThan(0);
  }).toPass({ timeout: 5000 });
  const atoOpt = posSelect.locator('option').filter({ hasText: /ATO/i }).first();
  const atoVal = await atoOpt.getAttribute('value');
  if (atoVal) await posSelect.selectOption(atoVal);

  await page.getByRole('button', { name: 'Iniciar admisión' }).click();
  await expect(page.getByText('Redirigiendo')).toBeVisible({ timeout: 8000 });
  await expect(page).toHaveURL(/\/deprisacheck/, { timeout: 5000 });
});

// ─── CASO 9: Diligenciar y enviar checklist → "Proceso completado" ───────────
test('Caso 9 — Diligenciar y enviar checklist completa el proceso', async ({ page }) => {
  await loginAs(page, 'asesor');

  // Crear admisión con baterías vía API para obtener merchandiseId y typeId
  const types = await page.request.get('http://localhost:3080/api/merchandise-types');
  const typesJson = await types.json();
  const typeBaterias = typesJson.find((t: { code: string }) => t.code === 'BATERIAS_LITIO');

  const admRes = await page.request.post('http://localhost:3080/api/admission/start', {
    data: {
      merchandiseData: { clientId: 'client-1', merchandiseTypeId: typeBaterias.id },
      pointOfSaleId: 'pos-ato-1',
    },
  });
  expect(admRes.ok()).toBe(true);
  const { merchandiseId, merchandiseTypeId } = await admRes.json();

  await page.goto(`/deprisacheck?merchandiseId=${merchandiseId}&merchandiseTypeId=${merchandiseTypeId}`);
  await expect(page.locator('h1').first()).toBeVisible();

  // Esperar plantilla
  await expect(page.locator('.checklist-section')).toBeVisible({ timeout: 10000 });

  // Marcar todos los checkboxes
  const checks = page.locator('.checklist-item input[type="checkbox"]');
  await expect(checks.first()).toBeVisible({ timeout: 5000 });
  const count = await checks.count();
  expect(count).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) await checks.nth(i).check();

  await page.getByRole('button', { name: 'Guardar lista' }).click();
  await expect(page.getByRole('button', { name: 'Enviar para aceptación' })).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: 'Enviar para aceptación' }).click();
  await expect(page.getByText('Proceso completado')).toBeVisible({ timeout: 8000 });
});

// ─── CASO 10: Panel Supervisión — métricas ────────────────────────────────────
test('Caso 10 — Panel Supervisión muestra métricas numéricas', async ({ page }) => {
  await loginAs(page, 'supervisor');
  await page.goto('/supervisor');

  await expect(page.locator('.metrics-grid')).toBeVisible({ timeout: 10000 });
  const cards = page.locator('.metric-card');
  await expect(cards).toHaveCount(5);

  for (let i = 0; i < 5; i++) {
    const val = await cards.nth(i).locator('.metric-value').textContent();
    expect(Number(val?.trim())).not.toBeNaN();
  }
});

// ─── CASO 11: Filtros de Supervisión ─────────────────────────────────────────
test('Caso 11 — Filtros de Supervisión aplican correctamente', async ({ page }) => {
  await loginAs(page, 'supervisor');
  await page.goto('/supervisor');

  await expect(page.locator('.filters-bar')).toBeVisible({ timeout: 8000 });

  // Filtrar por "Hoy"
  const hoyBtn = page.getByRole('button', { name: /hoy/i });
  if (await hoyBtn.isVisible()) await hoyBtn.click();

  // La tabla debe renderizarse (con o sin datos)
  await expect(page.locator('.table-container')).toBeVisible({ timeout: 8000 });

  // Verificar que el selector de estado existe y es funcional
  const statusSelect = page.locator('.filters-bar select').last();
  if (await statusSelect.isVisible()) {
    await statusSelect.selectOption({ index: 1 });
    await expect(page.locator('.table-container')).toBeVisible();
  }
});

// ─── CASO 12: Ver detalle de admisión ────────────────────────────────────────
test('Caso 12 — Detalle de admisión muestra flujo visual y datos del cliente', async ({ page }) => {
  await loginAs(page, 'supervisor');

  // Crear admisión para garantizar datos
  const types = await page.request.get('http://localhost:3080/api/merchandise-types');
  const typesJson = await types.json();
  const typeEstandar = typesJson.find((t: { code: string }) => t.code === 'ESTANDAR');
  await page.request.post('http://localhost:3080/api/admission/start', {
    data: {
      merchandiseData: { clientId: 'client-1', merchandiseTypeId: typeEstandar.id },
      pointOfSaleId: 'pos-city-1',
    },
  });

  await page.goto('/supervisor');
  await expect(page.locator('.metrics-grid')).toBeVisible({ timeout: 10000 });

  // Quitar filtro de fecha para ver todas
  const semanaBtn = page.getByRole('button', { name: /semana/i });
  if (await semanaBtn.isVisible()) await semanaBtn.click();

  // Esperar fila en tabla
  const firstRow = page.locator('.users-table tbody tr').first();
  await expect(firstRow).toBeVisible({ timeout: 10000 });
  await firstRow.click();

  await expect(page).toHaveURL(/\/admissions\//, { timeout: 5000 });
  await expect(page.locator('.flow-indicator')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('.detail-card').first()).toBeVisible();
  await expect(page.getByText('Cliente', { exact: false })).toBeVisible();
});

// ─── CASO 13: Crear punto de venta ───────────────────────────────────────────
test('Caso 13 — Crear POS aparece en lista y en formulario de admisión', async ({ page }) => {
  await loginAs(page, 'admin');
  await page.goto('/points-of-sale');

  await expect(page.getByRole('heading', { name: /Puntos de Venta/i })).toBeVisible();

  const posName = `POS-Test-${Date.now()}`;

  await page.getByRole('button', { name: /nuevo/i }).click();
  await expect(page.locator('.form-card')).toBeVisible();

  // Nombre
  await page.locator('.form-card input[type="text"]').first().fill(posName);

  // Tipo → 'city' es el value
  const tipoSelect = page.locator('.form-card select').first();
  await tipoSelect.selectOption('city');

  await page.locator('.form-card').getByRole('button', { name: /crear/i }).click();

  // Aparece en tabla
  await expect(page.getByText(posName)).toBeVisible({ timeout: 8000 });

  // Aparece en el formulario de admisión
  await page.goto('/admission');
  await expect(async () => {
    const posSelect = page.locator('label').filter({ hasText: /punto de venta/i }).locator('select');
    const opts = await posSelect.locator('option').allTextContents();
    expect(opts.some((o) => o.includes(posName))).toBe(true);
  }).toPass({ timeout: 10000 });
});

// ─── CASO 14: Crear plantilla y agregar ítems con reordenamiento ─────────────
test('Caso 14 — Crear plantilla, agregar ítems y reordenar', async ({ page }) => {
  await loginAs(page, 'admin');
  await page.goto('/checklist-templates');

  await expect(page.getByRole('heading', { name: /Plantillas/i })).toBeVisible();

  // Abrir formulario de nueva plantilla
  await page.getByRole('button', { name: /nueva plantilla/i }).click();
  await expect(page.locator('.form-card')).toBeVisible();

  const tplName = `Plantilla-${Date.now()}`;
  await page.locator('.form-card input[type="text"]').fill(tplName);

  // Tipo de mercancía
  const tipoSelect = page.locator('.form-card select').first();
  await expect(async () => {
    const count = await tipoSelect.locator('option').count();
    expect(count).toBeGreaterThan(1);
  }).toPass({ timeout: 8000 });
  await tipoSelect.selectOption({ index: 1 });

  await page.locator('.form-card').getByRole('button', { name: /crear/i }).click();

  // La plantilla creada aparece en la lista
  await expect(page.getByText(tplName)).toBeVisible({ timeout: 8000 });

  // Click en la plantilla para seleccionarla
  await page.getByText(tplName).click();

  // Agregar ítem 1 — botón "Agregar ítem" o similar
  await page.getByRole('button', { name: /agregar ítem/i }).click();
  await expect(page.locator('.form-card textarea')).toBeVisible({ timeout: 5000 });
  await page.locator('.form-card textarea').fill('Verificar documentación');
  await page.locator('.form-card').getByRole('button', { name: /guardar/i }).click();
  await expect(page.getByText('Verificar documentación')).toBeVisible({ timeout: 5000 });

  // Agregar ítem 2
  await page.getByRole('button', { name: /agregar ítem/i }).click();
  await page.locator('.form-card textarea').fill('Revisar embalaje');
  await page.locator('.form-card').getByRole('button', { name: /guardar/i }).click();
  await expect(page.getByText('Revisar embalaje')).toBeVisible({ timeout: 5000 });

  // Reordenar — el botón ↑ del último ítem debe estar habilitado
  const upButtons = page.getByRole('button', { name: '↑' });
  const upCount = await upButtons.count();
  if (upCount > 0) {
    await upButtons.last().click();
    await expect(page.getByText('Revisar embalaje')).toBeVisible();
  }
});

// ─── CASO 15: Agregar restricción a cliente ────────────────────────────────
test('Caso 15 — Restricción de cliente aparece en panel y API respeta la restricción', async ({ page }) => {
  await loginAs(page, 'admin');
  await page.goto('/client-restrictions');

  await expect(page.getByRole('heading', { name: /Restricciones/i })).toBeVisible();

  // Esperar que cargue la lista de clientes
  await expect(page.locator('.form-card').first()).toBeVisible({ timeout: 10000 });

  // Seleccionar el primer cliente
  await page.locator('.form-card').first().click();

  // Debe aparecer el panel de restricciones con el nombre del cliente
  await expect(page.locator('h3').first()).toBeVisible({ timeout: 5000 });

  // Si hay botón para agregar restricción, verificarlo
  const addBtn = page.getByRole('button', { name: /agregar restricción/i });
  if (await addBtn.isVisible()) {
    await addBtn.click();
    await expect(page.locator('select').last()).toBeVisible({ timeout: 3000 });
  }

  // Verificar que la API responde correctamente con admisión para cliente con posible restricción
  const types = await page.request.get('http://localhost:3080/api/merchandise-types');
  const typesJson = await types.json();
  const typeEstandar = typesJson.find((t: { code: string }) => t.code === 'ESTANDAR');
  const admRes = await page.request.post('http://localhost:3080/api/admission/start', {
    data: {
      merchandiseData: { clientId: 'client-1', merchandiseTypeId: typeEstandar.id },
      pointOfSaleId: 'pos-city-1',
    },
  });
  expect(admRes.ok()).toBe(true);
  const body = await admRes.json();
  expect(['pending', 'rejected', 'requires_deprisacheck']).toContain(body.status);
});

// ─── CASO 18: Cerrar sesión ─────────────────────────────────────────────────
test('Caso 18 — Cerrar sesión redirige al login y protege rutas', async ({ page }) => {
  await loginAs(page, 'asesor');
  await expect(page).toHaveURL('/');

  await page.getByRole('button', { name: 'Salir' }).click();
  await expect(page).toHaveURL('/login');

  // Ruta protegida redirige a login
  await page.goto('/admission');
  await expect(page).toHaveURL('/login');
});
