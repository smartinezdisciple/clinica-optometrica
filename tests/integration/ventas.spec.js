/**
 * @file ventas.spec.js
 * @description Tests de integración con Playwright para el módulo de Ventas.
 * Valida flujos completos de usuario: agregar productos, cobrar, historial.
 */
const { test, expect } = require('@playwright/test');
const path = require('path');

// URL del archivo local
const VENTAS_URL = `file://${path.resolve(__dirname, '../../interfaces/ventas.html')}`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function openVentas(page) {
    await page.goto(VENTAS_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#product-grid', { state: 'visible' });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUITE: Carga inicial
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Carga inicial de la página', () => {
    test('la página carga correctamente con título correcto', async ({ page }) => {
        await openVentas(page);
        await expect(page).toHaveTitle(/Ventas/i);
    });

    test('el grid de productos se renderiza', async ({ page }) => {
        await openVentas(page);
        const cards = page.locator('#product-grid > div');
        await expect(cards).toHaveCount(12); // 12 productos en el catálogo
    });

    test('el carrito inicia vacío', async ({ page }) => {
        await openVentas(page);
        await expect(page.locator('#cart-empty')).toBeVisible();
        await expect(page.locator('#cart-count-label')).toContainText('0');
    });

    test('el botón COBRAR inicia deshabilitado', async ({ page }) => {
        await openVentas(page);
        await expect(page.locator('#btn-cobrar')).toBeDisabled();
    });

    test('el sidebar es visible en desktop', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 800 });
        await openVentas(page);
        await expect(page.locator('#sidebar')).toBeVisible();
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SUITE: Búsqueda y filtros de productos
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Búsqueda y filtros de productos', () => {
    test('buscar "ray" muestra solo resultados coincidentes', async ({ page }) => {
        await openVentas(page);
        await page.fill('#product-search', 'ray');
        const cards = page.locator('#product-grid > div');
        const count = await cards.count();
        expect(count).toBeGreaterThan(0);
        expect(count).toBeLessThan(12);
    });

    test('búsqueda sin resultados muestra mensaje', async ({ page }) => {
        await openVentas(page);
        await page.fill('#product-search', 'xyzxyz99999');
        await expect(page.locator('#no-results')).toBeVisible();
    });

    test('filtro por categoría "Marcos" muestra solo marcos', async ({ page }) => {
        await openVentas(page);
        await page.click('button:has-text("Marcos")');
        const cards = await page.locator('#product-grid > div').count();
        // Hay 3 marcos en el catálogo de muestra
        expect(cards).toBe(3);
    });

    test('filtro "Todos" restaura el grid completo', async ({ page }) => {
        await openVentas(page);
        await page.click('button:has-text("Marcos")');
        await page.click('button:has-text("Todos")');
        const cards = await page.locator('#product-grid > div').count();
        expect(cards).toBe(12);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SUITE: Gestión del carrito
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Gestión del carrito', () => {
    test('agregar un producto al carrito muestra el ítem', async ({ page }) => {
        await openVentas(page);
        // Click primer botón "add" del grid
        await page.locator('#product-grid button[onclick*="addToCart"]').first().click();
        await expect(page.locator('#cart-items .cart-item')).toHaveCount(1);
    });

    test('el botón COBRAR se habilita al agregar un producto', async ({ page }) => {
        await openVentas(page);
        await page.locator('#product-grid button[onclick*="addToCart"]').first().click();
        await expect(page.locator('#btn-cobrar')).not.toBeDisabled();
    });

    test('el contador del badge refleja ítems en carrito', async ({ page }) => {
        await openVentas(page);
        await page.locator('#product-grid button[onclick*="addToCart"]').first().click();
        const badge = page.locator('#cart-badge');
        await expect(badge).not.toHaveClass(/hidden/);
        await expect(badge).toContainText('1');
    });

    test('el subtotal se actualiza al agregar producto', async ({ page }) => {
        await openVentas(page);
        const subBefore = await page.locator('#subtotal-display').textContent();
        await page.locator('#product-grid button[onclick*="addToCart"]').first().click();
        const subAfter = await page.locator('#subtotal-display').textContent();
        expect(subBefore).not.toBe(subAfter);
    });

    test('vaciar carrito regresa al estado inicial', async ({ page }) => {
        await openVentas(page);
        await page.locator('#product-grid button[onclick*="addToCart"]').first().click();
        await page.click('button:has-text("Vaciar")');
        await expect(page.locator('#cart-empty')).toBeVisible();
        await expect(page.locator('#btn-cobrar')).toBeDisabled();
    });

    test('aplicar descuento actualiza el total', async ({ page }) => {
        await openVentas(page);
        await page.locator('#product-grid button[onclick*="addToCart"]').first().click();
        const totalBefore = await page.locator('#total-display').textContent();
        await page.fill('#discount-input', '10');
        await page.dispatchEvent('#discount-input', 'input');
        const totalAfter = await page.locator('#total-display').textContent();
        expect(totalBefore).not.toBe(totalAfter);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SUITE: Modal de pago
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Modal de pago', () => {
    test('abrir modal de pago muestra el total correcto', async ({ page }) => {
        await openVentas(page);
        await page.locator('#product-grid button[onclick*="addToCart"]').first().click();
        await page.click('#btn-cobrar');
        await expect(page.locator('#modal-payment')).not.toHaveClass(/hidden/);
        const modalTotal = await page.locator('#modal-total').textContent();
        expect(modalTotal).toMatch(/\$/);
    });

    test('seleccionar método Tarjeta oculta sección de efectivo', async ({ page }) => {
        await openVentas(page);
        await page.locator('#product-grid button[onclick*="addToCart"]').first().click();
        await page.click('#btn-cobrar');
        await page.click('button:has-text("Tarjeta")');
        await expect(page.locator('#cash-section')).toHaveClass(/hidden/);
    });

    test('seleccionar Efectivo muestra campo de monto recibido', async ({ page }) => {
        await openVentas(page);
        await page.locator('#product-grid button[onclick*="addToCart"]').first().click();
        await page.click('#btn-cobrar');
        await page.click('button:has-text("Tarjeta")');
        await page.click('button:has-text("Efectivo")');
        await expect(page.locator('#cash-section')).not.toHaveClass(/hidden/);
    });

    test('ingresar monto de efectivo calcula el cambio', async ({ page }) => {
        await openVentas(page);
        await page.locator('#product-grid button[onclick*="addToCart"]').first().click();
        await page.click('#btn-cobrar');
        await page.fill('#cash-received', '10000');
        await page.dispatchEvent('#cash-received', 'input');
        const change = await page.locator('#change-display').textContent();
        expect(change).toMatch(/\$/);
        expect(change).not.toBe('$0.00');
    });

    test('cerrar modal lo oculta', async ({ page }) => {
        await openVentas(page);
        await page.locator('#product-grid button[onclick*="addToCart"]').first().click();
        await page.click('#btn-cobrar');
        await page.click('button[onclick="closePaymentModal()"]');
        await expect(page.locator('#modal-payment')).toHaveClass(/hidden/);
    });

    test('confirmar pago abre el modal de recibo', async ({ page }) => {
        await openVentas(page);
        await page.locator('#product-grid button[onclick*="addToCart"]').first().click();
        await page.click('#btn-cobrar');
        await page.fill('#cash-received', '99999');
        await page.dispatchEvent('#cash-received', 'input');
        await page.click('#btn-confirm-pay');
        await expect(page.locator('#modal-receipt')).not.toHaveClass(/hidden/);
    });

    test('el modal de recibo muestra el número de orden', async ({ page }) => {
        await openVentas(page);
        await page.locator('#product-grid button[onclick*="addToCart"]').first().click();
        await page.click('#btn-cobrar');
        await page.fill('#cash-received', '99999');
        await page.dispatchEvent('#cash-received', 'input');
        await page.click('#btn-confirm-pay');
        await expect(page.locator('#receipt-order-num')).toContainText('ORD-');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SUITE: Historial de ventas
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Historial de ventas', () => {
    test('cambiar a tab historial muestra la tabla de órdenes', async ({ page }) => {
        await openVentas(page);
        await page.click('#tab-history');
        await expect(page.locator('#panel-history')).not.toHaveClass(/hidden/);
        const count = await page.locator('#history-table-body tr').count();
        expect(count).toBeGreaterThanOrEqual(1);
    });

    test('filtro "Completadas" muestra solo órdenes completadas', async ({ page }) => {
        await openVentas(page);
        await page.click('#tab-history');
        await page.click('#panel-history button:has-text("Completadas")');
        const rows = await page.locator('#history-table-body tr').count();
        expect(rows).toBeGreaterThan(0);
    });

    test('buscar orden por ID filtra la tabla', async ({ page }) => {
        await openVentas(page);
        await page.click('#tab-history');
        await page.fill('#panel-history input[type="text"]', 'ORD-2940');
        const rows = await page.locator('#history-table-body tr').count();
        expect(rows).toBe(1);
    });

    test('el botón de detalle abre el modal de orden', async ({ page }) => {
        await openVentas(page);
        await page.click('#tab-history');
        await page.locator('#history-table-body button').first().click();
        await expect(page.locator('#modal-order-detail')).not.toHaveClass(/hidden/);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SUITE: Responsividad
// ═══════════════════════════════════════════════════════════════════════════════
test.describe('Responsividad móvil', () => {
    test('en móvil el sidebar inicia oculto', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await openVentas(page);
        const sidebar = page.locator('#sidebar');
        const transform = await sidebar.evaluate(el => getComputedStyle(el).transform);
        // -translate-x-full => matrix con translateX negativo
        expect(transform).not.toBe('none');
    });
});
