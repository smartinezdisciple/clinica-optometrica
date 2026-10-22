"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findMetodosPago = findMetodosPago;
exports.findProductosVendibles = findProductosVendibles;
exports.findSerialesDisponibles = findSerialesDisponibles;
exports.findProductoVenta = findProductoVenta;
exports.getStockGranel = getStockGranel;
exports.findUnidadVenta = findUnidadVenta;
exports.findMetodoPagoActivo = findMetodoPagoActivo;
exports.existeCliente = existeCliente;
exports.findVentas = findVentas;
exports.findVentaById = findVentaById;
exports.createVentaInTx = createVentaInTx;
exports.findCajaAbierta = findCajaAbierta;
exports.updateEstadoVenta = updateEstadoVenta;
exports.getResumenVentas = getResumenVentas;
const database_1 = require("../../config/database");
const manejo_errores_1 = require("../../middleware/manejo-errores");
// ─── Catálogos ─────────────────────────────────────────────────────────────────
async function findMetodosPago() {
    const result = await (0, database_1.query)(`SELECT id_metodo_pago, nombre_metodo_pago, descripcion, tipo_metodo_pago
     FROM metodos_pago
     WHERE activo = TRUE
     ORDER BY nombre_metodo_pago`);
    return result.rows;
}
/**
 * Productos activos con stock disponible en la sucursal.
 * Para serializados, la cantidad es el conteo de unidades disponibles.
 */
async function findProductosVendibles(sucursalId) {
    const result = await (0, database_1.query)(`SELECT
        p.id_producto,
        p.nombre_producto,
        p.tipo_producto,
        p.tipo_manejo,
        p.precio_venta::float8 AS precio_venta,
        CASE WHEN p.tipo_manejo = 'serializado'
             THEN COALESCE(ser.cnt, 0)
             ELSE COALESCE(inv.cantidad, 0)
        END AS cantidad
      FROM productos p
      LEFT JOIN inventario_sucursal inv
        ON inv.id_producto = p.id_producto AND inv.id_sucursal = $1
      LEFT JOIN LATERAL (
        SELECT COUNT(*)::int AS cnt
        FROM unidades_serializadas u
        WHERE u.id_producto = p.id_producto
          AND u.estado = 'disponible'
          AND (u.id_sucursal = $1 OR u.id_sucursal IS NULL)
      ) ser ON TRUE
      WHERE p.activo = TRUE
      ORDER BY p.nombre_producto`, [sucursalId]);
    return result.rows;
}
async function findSerialesDisponibles(productoId, sucursalId) {
    const result = await (0, database_1.query)(`SELECT id_unidad, numero_serie, id_producto
     FROM unidades_serializadas
     WHERE id_producto = $1
       AND estado = 'disponible'
       AND (id_sucursal = $2 OR id_sucursal IS NULL)
     ORDER BY fecha_ingreso, id_unidad`, [productoId, sucursalId]);
    return result.rows;
}
async function findProductoVenta(idProducto) {
    const result = await (0, database_1.query)(`SELECT id_producto, nombre_producto, tipo_manejo,
            precio_venta::float8 AS precio_venta, activo
     FROM productos WHERE id_producto = $1`, [idProducto]);
    return result.rows[0] ?? null;
}
async function getStockGranel(idProducto, sucursalId) {
    const result = await (0, database_1.query)(`SELECT COALESCE(cantidad, 0)::int AS cantidad
     FROM inventario_sucursal
     WHERE id_producto = $1 AND id_sucursal = $2`, [idProducto, sucursalId]);
    return result.rows[0]?.cantidad ?? 0;
}
async function findUnidadVenta(idUnidad) {
    const result = await (0, database_1.query)(`SELECT id_unidad, id_producto, estado FROM unidades_serializadas WHERE id_unidad = $1`, [idUnidad]);
    return result.rows[0] ?? null;
}
async function findMetodoPagoActivo(idMetodoPago) {
    const result = await (0, database_1.query)(`SELECT id_metodo_pago, nombre_metodo_pago, descripcion, tipo_metodo_pago
     FROM metodos_pago WHERE id_metodo_pago = $1 AND activo = TRUE`, [idMetodoPago]);
    return result.rows[0] ?? null;
}
async function existeCliente(idCliente) {
    const result = await (0, database_1.query)('SELECT id_cliente FROM clientes WHERE id_cliente = $1', [idCliente]);
    return result.rows.length > 0;
}
// ─── Ventas (listado / detalle) ────────────────────────────────────────────────
async function findVentas(filtros) {
    const condiciones = [];
    const params = [];
    if (filtros.estado) {
        params.push(filtros.estado);
        condiciones.push(`v.estado_venta = $${params.length}`);
    }
    if (filtros.busqueda) {
        params.push(`%${filtros.busqueda}%`);
        condiciones.push(`(COALESCE(e.razon_social, c.nombres || ' ' || c.apellidos) ILIKE $${params.length}
                       OR v.id_venta::text ILIKE $${params.length})`);
    }
    if (filtros.fecha_desde) {
        params.push(filtros.fecha_desde);
        condiciones.push(`v.fecha_venta >= $${params.length}::date`);
    }
    if (filtros.fecha_hasta) {
        params.push(filtros.fecha_hasta);
        condiciones.push(`v.fecha_venta <= $${params.length}::date`);
    }
    const where = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';
    const result = await (0, database_1.query)(`SELECT
        v.id_venta,
        v.fecha_venta::text AS fecha_venta,
        v.estado_venta,
        v.subtotal::float8          AS subtotal,
        v.descuento_aplicado::float8 AS descuento_aplicado,
        v.total_venta::float8       AS total_venta,
        v.id_cliente,
        COALESCE(e.razon_social, c.nombres || ' ' || c.apellidos) AS nombre_cliente,
        (SELECT COUNT(*)::int FROM detalles_venta d WHERE d.id_venta = v.id_venta) AS numero_items
      FROM ventas v
      JOIN clientes c ON c.id_cliente = v.id_cliente
      LEFT JOIN empresas e ON e.id_cliente = c.id_cliente
      ${where}
      ORDER BY v.id_venta DESC
      LIMIT 200`, params);
    return result.rows;
}
async function findVentaById(idVenta) {
    const head = await (0, database_1.query)(`SELECT
        v.id_venta,
        v.fecha_venta::text AS fecha_venta,
        v.estado_venta,
        v.subtotal::float8          AS subtotal,
        v.descuento_aplicado::float8 AS descuento_aplicado,
        v.total_venta::float8       AS total_venta,
        v.id_cliente,
        COALESCE(e.razon_social, c.nombres || ' ' || c.apellidos) AS nombre_cliente,
        (SELECT COUNT(*)::int FROM detalles_venta d WHERE d.id_venta = v.id_venta) AS numero_items
      FROM ventas v
      JOIN clientes c ON c.id_cliente = v.id_cliente
      LEFT JOIN empresas e ON e.id_cliente = c.id_cliente
      WHERE v.id_venta = $1`, [idVenta]);
    if (head.rows.length === 0)
        return null;
    const items = await (0, database_1.query)(`SELECT
        d.id_detalle_venta,
        d.cantidad,
        d.precio_unitario::float8 AS precio_unitario,
        d.subtotal::float8        AS subtotal,
        COALESCE(p.nombre_producto, pu.nombre_producto) AS nombre_producto,
        u.numero_serie
      FROM detalles_venta d
      LEFT JOIN productos p ON p.id_producto = d.id_producto
      LEFT JOIN unidades_serializadas u ON u.id_unidad = d.id_unidad_serializada
      LEFT JOIN productos pu ON pu.id_producto = u.id_producto
      WHERE d.id_venta = $1
      ORDER BY d.id_detalle_venta`, [idVenta]);
    const pago = await (0, database_1.query)(`SELECT pg.id_pago, pg.monto::float8 AS monto, pg.referencia_pago, pg.notas,
            pg.id_metodo_pago, mp.nombre_metodo_pago
     FROM pagos pg
     JOIN metodos_pago mp ON mp.id_metodo_pago = pg.id_metodo_pago
     WHERE pg.id_pago = (SELECT id_pago FROM ventas WHERE id_venta = $1)`, [idVenta]);
    return {
        ...head.rows[0],
        items: items.rows,
        pago: pago.rows[0] ?? null,
    };
}
/**
 * Registra la venta completa en una sola transacción.
 *
 * Importante: NO actualiza inventario ni totales manualmente. La base de datos
 * los calcula mediante los triggers `tg_restar_inventario_venta` (solo aplica a
 * líneas con `id_producto`) y `tg_calcular_totales_venta`.
 *
 * Para líneas serializadas se envía `id_producto = NULL` y se enlaza la unidad
 * (`id_unidad_serializada`): así el stock no se descuenta por cantidad (el
 * producto se controla por unidades) y la unidad pasa a `vendido`.
 */
async function createVentaInTx(params) {
    return (0, database_1.withTransaction)(async (client) => {
        const venta = await client.query(`INSERT INTO ventas (estado_venta, descuento_aplicado, id_cliente, id_empleado)
       VALUES ('en_proceso', $1, $2, $3)
       RETURNING id_venta`, [params.descuentoAplicado, params.clienteId, params.empleadoId]);
        const idVenta = venta.rows[0].id_venta;
        for (const item of params.items) {
            if (item.id_unidad_serializada !== null) {
                const unidad = await client.query(`UPDATE unidades_serializadas
           SET estado = 'vendido', fecha_venta = CURRENT_TIMESTAMP
           WHERE id_unidad = $1 AND estado = 'disponible'
           RETURNING id_unidad`, [item.id_unidad_serializada]);
                if (unidad.rowCount === 0) {
                    throw new manejo_errores_1.AppError(409, 'Una de las unidades serializadas ya no está disponible');
                }
            }
            await client.query(`INSERT INTO detalles_venta
            (cantidad, precio_unitario, id_venta, id_producto, id_unidad_serializada)
         VALUES ($1, $2, $3, $4, $5)`, [item.cantidad, item.precio_unitario, idVenta, item.id_producto, item.id_unidad_serializada]);
        }
        // El trigger ya recalculó subtotal y total_venta.
        const totales = await client.query(`SELECT subtotal::float8, total_venta::float8 FROM ventas WHERE id_venta = $1`, [idVenta]);
        const subtotal = Number(totales.rows[0].subtotal);
        const total = Number(totales.rows[0].total_venta);
        if (total <= 0) {
            throw new manejo_errores_1.AppError(400, 'El total de la venta debe ser mayor a 0');
        }
        const pago = await client.query(`INSERT INTO pagos (monto, referencia_pago, notas, id_metodo_pago)
       VALUES ($1, $2, $3, $4)
       RETURNING id_pago`, [total, params.referenciaPago, params.nota, params.metodoPagoId]);
        const idPago = pago.rows[0].id_pago;
        await client.query(`UPDATE ventas SET id_pago = $1, estado_venta = 'finalizada' WHERE id_venta = $2`, [idPago, idVenta]);
        // Registrar el ingreso en caja si hay una apertura activa en la sucursal.
        const caja = await findCajaAbierta(client, params.sucursalId);
        if (caja !== null) {
            await client.query(`INSERT INTO movimientos_financieros
            (tipo_movimiento, monto, descripcion, id_caja, id_venta, id_usuario)
         VALUES ('ingreso', $1, $2, $3, $4, $5)`, [total, `Venta #${idVenta}`, caja, idVenta, params.usuarioId]);
        }
        return {
            id_venta: idVenta,
            subtotal,
            descuento_aplicado: params.descuentoAplicado,
            total,
            estado: 'finalizada',
        };
    });
}
/**
 * Devuelve el id de la caja con apertura activa en la sucursal, o null.
 */
async function findCajaAbierta(client, sucursalId) {
    const result = await client.query(`SELECT c.id_caja
     FROM cajas c
     JOIN aperturas_caja a ON a.id_caja = c.id_caja
     LEFT JOIN cierres_caja ci ON ci.id_apertura = a.id_apertura
     WHERE c.id_sucursal = $1 AND ci.id_cierre IS NULL
     ORDER BY a.fecha_apertura DESC
     LIMIT 1`, [sucursalId]);
    return result.rows[0]?.id_caja ?? null;
}
// ─── Cambio de estado ──────────────────────────────────────────────────────────
/**
 * Cambia el estado de la venta. Al cancelar, revierte el inventario:
 * - Líneas granel (`id_producto`): devuelve la cantidad a `inventario_sucursal`
 *   y registra un movimiento de entrada.
 * - Líneas serializadas: la unidad vuelve a `disponible`.
 */
async function updateEstadoVenta(idVenta, estado, usuarioId) {
    await (0, database_1.withTransaction)(async (client) => {
        const actual = await client.query(`SELECT v.estado_venta, e.id_sucursal AS sucursal_id
       FROM ventas v
       JOIN empleados e ON e.id_empleado = v.id_empleado
       WHERE v.id_venta = $1
       FOR UPDATE OF v`, [idVenta]);
        if (actual.rows.length === 0)
            throw new manejo_errores_1.AppError(404, 'La venta no existe');
        const estadoActual = actual.rows[0].estado_venta;
        const sucursalId = actual.rows[0].sucursal_id;
        if (estado === 'cancelada' && estadoActual !== 'cancelada') {
            const detalles = await client.query(`SELECT id_producto, id_unidad_serializada, cantidad
         FROM detalles_venta WHERE id_venta = $1`, [idVenta]);
            for (const d of detalles.rows) {
                if (d.id_producto !== null) {
                    await client.query(`INSERT INTO inventario_sucursal (id_producto, id_sucursal, cantidad)
             VALUES ($1, $2, $3)
             ON CONFLICT (id_producto, id_sucursal)
             DO UPDATE SET cantidad = inventario_sucursal.cantidad + EXCLUDED.cantidad`, [d.id_producto, sucursalId, d.cantidad]);
                    await client.query(`INSERT INTO movimientos_inventario
                (tipo_movimiento, cantidad, motivo, id_producto, id_sucursal, id_usuario)
             VALUES ('entrada', $1, $2, $3, $4, $5)`, [d.cantidad, `Cancelación venta #${idVenta}`, d.id_producto, sucursalId, usuarioId]);
                }
                if (d.id_unidad_serializada !== null) {
                    await client.query(`UPDATE unidades_serializadas
             SET estado = 'disponible', fecha_venta = NULL
             WHERE id_unidad = $1 AND estado = 'vendido'`, [d.id_unidad_serializada]);
                }
            }
        }
        await client.query(`UPDATE ventas SET estado_venta = $1 WHERE id_venta = $2`, [estado, idVenta]);
    });
}
// ─── Resumen (KPIs) ────────────────────────────────────────────────────────────
async function getResumenVentas(filtros) {
    const condiciones = [`v.estado_venta = 'finalizada'`];
    const params = [];
    if (filtros.fecha_desde) {
        params.push(filtros.fecha_desde);
        condiciones.push(`v.fecha_venta >= $${params.length}::date`);
    }
    if (filtros.fecha_hasta) {
        params.push(filtros.fecha_hasta);
        condiciones.push(`v.fecha_venta <= $${params.length}::date`);
    }
    const result = await (0, database_1.query)(`SELECT
        COALESCE(SUM(v.total_venta), 0)::float8 AS total_vendido,
        COUNT(*)::int AS numero_ventas
     FROM ventas v
     WHERE ${condiciones.join(' AND ')}`, params);
    return {
        totalVendido: Number(result.rows[0].total_vendido),
        numeroVentas: result.rows[0].numero_ventas,
    };
}
//# sourceMappingURL=ventas.repository.js.map