/**
 * E2E - Flujo de admisión vía UI
 * Tareas 6.3.1, 6.3.2
 */
import { test, expect } from '@playwright/test';

test.describe('Flujo de admisión vía UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('Usuario').fill('test-user');
    await page.getByRole('button', { name: 'Entrar' }).click();
    await expect(page).toHaveURL('/');
    await page.goto('/admission');
    await expect(page.getByRole('heading', { name: 'Nueva Admisión' })).toBeVisible();
    // Esperar a que carguen los tipos de mercancía (API respondió): placeholder + al menos 1 tipo
    await expect(async () => {
      const n = await page.getByLabel('Tipo de mercancía').locator('option').count();
      expect(n).toBeGreaterThanOrEqual(2);
    }).toPass({ timeout: 15000 });
  });

  test('6.3.2 Admisión mercancía estándar muestra estado pending', async ({ page }) => {
    await page.getByLabel('ID Cliente').fill('client-1');
    // Seleccionar "Mercancía estándar" por texto
    const estandarValue = await page.getByLabel('Tipo de mercancía').locator('option').filter({ hasText: 'estándar' }).first().getAttribute('value');
    await page.getByLabel('Tipo de mercancía').selectOption(estandarValue!);
    await page.getByLabel('Punto de venta').selectOption({ index: 1 });

    await page.getByRole('button', { name: 'Iniciar admisión' }).click();

    await expect(page.getByText('Estado:', { exact: false })).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('pending')).toBeVisible();
    await expect(page.getByText('ID Mercancía:', { exact: false })).toBeVisible();
  });

  test('Sin tipo seleccionado no muestra resultado (validación HTML5 o cliente)', async ({ page }) => {
    // El select tiene required; el navegador o la app evitan submit sin selección
    await page.getByRole('button', { name: 'Iniciar admisión' }).click();
    // No debe aparecer el cuadro de resultado con Estado/ID Mercancía
    await expect(page.getByText('ID Mercancía:')).not.toBeVisible();
  });
});
