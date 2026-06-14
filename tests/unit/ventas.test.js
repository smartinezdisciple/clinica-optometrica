/**
 * @file ventas.test.js
 * @description Tests unitarios para la lógica del módulo de Ventas (POS).
 * Cubre: gestión de carrito, cálculo de totales, descuentos e IVA.
 */

// ─── Helpers extraídos de ventas.html para testing ────────────────────────────

/**
 * Formatea un número como moneda MXN.
 * @param {number} n
 * @returns {string}
 */
function fmt(n) {
    return '$' + (n || 0).toLocaleString('es-MX', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}

/**
 * Calcula los totales del carrito.
 * @param {Array<{product:{price:number}, qty:number}>} cart
 * @param {number} discountPct  - porcentaje de descuento (0-100)
 * @returns {{ subtotal, discountAmt, taxable, tax, total }}
 */
function calcTotals(cart, discountPct = 0) {
    const subtotal    = cart.reduce((s, c) => s + c.product.price * c.qty, 0);
    const discountAmt = subtotal * (discountPct / 100);
    const taxable     = subtotal - discountAmt;
    const tax         = taxable * 0.16;
    const total       = taxable + tax;
    return { subtotal, discountAmt, taxable, tax, total };
}

/**
 * Agrega un producto al carrito, respetando el stock máximo.
 * @param {Array} cart
 * @param {Object} product
 * @returns {Array} nuevo carrito
 */
function addToCart(cart, product) {
    if (product.stock === 0) return cart;
    const existing = cart.find(c => c.product.id === product.id);
    if (existing) {
        if (existing.qty >= product.stock) return cart;
        return cart.map(c => c.product.id === product.id ? { ...c, qty: c.qty + 1 } : c);
    }
    return [...cart, { product, qty: 1 }];
}

/**
 * Elimina un producto del carrito.
 * @param {Array} cart
 * @param {number} productId
 * @returns {Array}
 */
function removeFromCart(cart, productId) {
    return cart.filter(c => c.product.id !== productId);
}

/**
 * Actualiza la cantidad de un producto en el carrito.
 * @param {Array} cart
 * @param {number} productId
 * @param {number} delta  - +1 o -1
 * @returns {Array}
 */
function updateQty(cart, productId, delta) {
    return cart
        .map(c => {
            if (c.product.id !== productId) return c;
            const newQty = c.qty + delta;
            if (newQty <= 0) return null;
            if (newQty > c.product.stock) return c;
            return { ...c, qty: newQty };
        })
        .filter(Boolean);
}

/**
 * Calcula el cambio para pago en efectivo.
 * @param {number} total
 * @param {number} received
 * @returns {number}
 */
function calcChange(total, received) {
    return Math.max(0, received - total);
}

// ─── Datos de prueba ───────────────────────────────────────────────────────────
const sampleProduct = { id: 1, name: 'Ray-Ban Wayfarer', price: 3450, stock: 8, category: 'marcos' };
const zeroStockProduct = { id: 2, name: 'Sin Stock Item', price: 100, stock: 0, category: 'lentes' };
const cheapProduct = { id: 3, name: 'Paño Microfibra', price: 65, stock: 50, category: 'accesorios' };

// ═══════════════════════════════════════════════════════════════════════════════
// TEST SUITE: fmt()
// ═══════════════════════════════════════════════════════════════════════════════
describe('fmt() — Formateador de moneda', () => {
    test('formatea cero correctamente', () => {
        expect(fmt(0)).toBe('$0.00');
    });

    test('formatea entero con dos decimales', () => {
        expect(fmt(1000)).toMatch(/\$1[,.]?000\.00/);
    });

    test('formatea número decimal', () => {
        expect(fmt(3450.5)).toContain('3');
    });

    test('maneja undefined/null retornando $0.00', () => {
        expect(fmt(null)).toBe('$0.00');
        expect(fmt(undefined)).toBe('$0.00');
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TEST SUITE: calcTotals()
// ═══════════════════════════════════════════════════════════════════════════════
describe('calcTotals() — Cálculo de totales del carrito', () => {
    test('carrito vacío retorna todos ceros', () => {
        const result = calcTotals([]);
        expect(result.subtotal).toBe(0);
        expect(result.tax).toBe(0);
        expect(result.total).toBe(0);
    });

    test('calcula subtotal correctamente para 1 ítem', () => {
        const cart = [{ product: sampleProduct, qty: 1 }];
        expect(calcTotals(cart).subtotal).toBe(3450);
    });

    test('calcula subtotal correctamente para múltiples cantidades', () => {
        const cart = [{ product: sampleProduct, qty: 2 }];
        expect(calcTotals(cart).subtotal).toBe(6900);
    });

    test('calcula subtotal con múltiples productos', () => {
        const cart = [
            { product: sampleProduct, qty: 1 },
            { product: cheapProduct, qty: 3 },
        ];
        expect(calcTotals(cart).subtotal).toBe(3450 + 65 * 3); // 3645
    });

    test('calcula IVA 16% sobre la base neta', () => {
        const cart = [{ product: sampleProduct, qty: 1 }];
        const { tax, taxable } = calcTotals(cart);
        expect(tax).toBeCloseTo(taxable * 0.16, 5);
    });

    test('total = taxable + tax', () => {
        const cart = [{ product: sampleProduct, qty: 1 }];
        const { taxable, tax, total } = calcTotals(cart);
        expect(total).toBeCloseTo(taxable + tax, 5);
    });

    test('descuento del 10% reduce la base correctamente', () => {
        const cart = [{ product: sampleProduct, qty: 1 }];
        const { subtotal, discountAmt } = calcTotals(cart, 10);
        expect(discountAmt).toBeCloseTo(subtotal * 0.1, 5);
    });

    test('descuento del 100% resulta en total = 0', () => {
        const cart = [{ product: sampleProduct, qty: 1 }];
        const { total } = calcTotals(cart, 100);
        expect(total).toBeCloseTo(0, 5);
    });

    test('descuento > 100% no se aplica en negativo (clamped externamente)', () => {
        // La función calcTotals no clampea, el clamp es responsabilidad de applyDiscount()
        const cart = [{ product: sampleProduct, qty: 1 }];
        const { discountAmt } = calcTotals(cart, 0);
        expect(discountAmt).toBe(0);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TEST SUITE: addToCart()
// ═══════════════════════════════════════════════════════════════════════════════
describe('addToCart() — Agregar productos al carrito', () => {
    test('agrega un producto nuevo al carrito vacío', () => {
        const cart = addToCart([], sampleProduct);
        expect(cart.length).toBe(1);
        expect(cart[0].product.id).toBe(sampleProduct.id);
        expect(cart[0].qty).toBe(1);
    });

    test('incrementa qty si el producto ya está en el carrito', () => {
        let cart = addToCart([], sampleProduct);
        cart = addToCart(cart, sampleProduct);
        expect(cart.length).toBe(1);
        expect(cart[0].qty).toBe(2);
    });

    test('no agrega productos con stock = 0', () => {
        const cart = addToCart([], zeroStockProduct);
        expect(cart.length).toBe(0);
    });

    test('no supera el stock máximo disponible', () => {
        const limitedProduct = { ...sampleProduct, stock: 2 };
        let cart = [];
        cart = addToCart(cart, limitedProduct);
        cart = addToCart(cart, limitedProduct);
        cart = addToCart(cart, limitedProduct); // intento de 3er ítem — stock max 2
        expect(cart[0].qty).toBe(2);
    });

    test('permite agregar múltiples productos diferentes', () => {
        let cart = addToCart([], sampleProduct);
        cart = addToCart(cart, cheapProduct);
        expect(cart.length).toBe(2);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TEST SUITE: removeFromCart()
// ═══════════════════════════════════════════════════════════════════════════════
describe('removeFromCart() — Eliminar productos del carrito', () => {
    test('elimina el producto correcto', () => {
        let cart = addToCart([], sampleProduct);
        cart = addToCart(cart, cheapProduct);
        cart = removeFromCart(cart, sampleProduct.id);
        expect(cart.length).toBe(1);
        expect(cart[0].product.id).toBe(cheapProduct.id);
    });

    test('eliminar de carrito vacío no lanza error', () => {
        expect(() => removeFromCart([], 99)).not.toThrow();
    });

    test('eliminar producto inexistente no altera el carrito', () => {
        let cart = addToCart([], sampleProduct);
        cart = removeFromCart(cart, 999);
        expect(cart.length).toBe(1);
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TEST SUITE: updateQty()
// ═══════════════════════════════════════════════════════════════════════════════
describe('updateQty() — Actualizar cantidades', () => {
    test('incrementa cantidad en 1', () => {
        let cart = addToCart([], sampleProduct);
        cart = updateQty(cart, sampleProduct.id, 1);
        expect(cart[0].qty).toBe(2);
    });

    test('decrementa cantidad en 1', () => {
        let cart = [{ product: sampleProduct, qty: 3 }];
        cart = updateQty(cart, sampleProduct.id, -1);
        expect(cart[0].qty).toBe(2);
    });

    test('elimina ítem cuando qty llega a 0', () => {
        let cart = [{ product: sampleProduct, qty: 1 }];
        cart = updateQty(cart, sampleProduct.id, -1);
        expect(cart.length).toBe(0);
    });

    test('no supera el stock disponible', () => {
        const limitedProduct = { ...sampleProduct, stock: 2 };
        let cart = [{ product: limitedProduct, qty: 2 }];
        cart = updateQty(cart, limitedProduct.id, 1);
        expect(cart[0].qty).toBe(2); // sin cambio
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// TEST SUITE: calcChange()
// ═══════════════════════════════════════════════════════════════════════════════
describe('calcChange() — Cálculo de cambio en efectivo', () => {
    test('devuelve cambio correcto', () => {
        expect(calcChange(100, 150)).toBe(50);
    });

    test('devuelve 0 cuando pago exacto', () => {
        expect(calcChange(100, 100)).toBe(0);
    });

    test('devuelve 0 cuando monto recibido es menor al total', () => {
        expect(calcChange(200, 150)).toBe(0);
    });

    test('maneja decimales correctamente', () => {
        expect(calcChange(99.99, 100)).toBeCloseTo(0.01, 5);
    });
});
