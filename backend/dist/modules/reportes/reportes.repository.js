"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findResumenVentas = findResumenVentas;
exports.findSerieVentas = findSerieVentas;
exports.findVentasPorMetodoPago = findVentasPorMetodoPago;
exports.findVentasPorSucursal = findVentasPorSucursal;
exports.findTopProductos = findTopProductos;
exports.findVentasPorEstado = findVentasPorEstado;
exports.findResumenCompras = findResumenCompras;
exports.findSerieCompras = findSerieCompras;
exports.findComprasPorProveedor = findComprasPorProveedor;
exports.findComprasPorEstado = findComprasPorEstado;
exports.findResumenCitas = findResumenCitas;
exports.findCitasPorEstado = findCitasPorEstado;
exports.findSerieCitas = findSerieCitas;
exports.findResumenInventario = findResumenInventario;
exports.findStockBajo = findStockBajo;
exports.findInventarioPorSucursal = findInventarioPorSucursal;
const database_1 = require("../../config/database");
// ─── Fragmentos de filtrado ────────────────────────────────────────────────────
// Las ventas y compras no guardan sucursal: se deriva del empleado que registró
// la operación. Las citas se derivan del empleado (optometrista) asignado.
const FILTRO_VENTAS = `
  v.fecha_venta BETWEEN $1 AND $2
  AND ($3::int IS NULL OR e.id_sucursal = $3)
`;
const FILTRO_COMPRAS = `
  c.fecha_compra BETWEEN $1 AND $2
  AND ($3::int IS NULL OR e.id_sucursal = $3)
`;
const FILTRO_CITAS = `
  c.fecha_hora_cita::date BETWEEN $1::date AND $2::date
  AND ($3::int IS NULL OR e.id_sucursal = $3)
`;
// ─── Ventas ────────────────────────────────────────────────────────────────────
async function findResumenVentas(f) {
    const result = await (0, database_1.query)(`SELECT
        COALESCE(SUM(v.total_venta), 0)::float8       AS "totalVendido",
        COUNT(*)::int                                  AS "numeroVentas",
        COALESCE(SUM(v.descuento_aplicado), 0)::float8 AS "totalDescuentos",
        COALESCE(SUM(v.subtotal), 0)::float8           AS "subtotal"
     FROM ventas v
     JOIN empleados e ON e.id_empleado = v.id_empleado
     WHERE ${FILTRO_VENTAS} AND v.estado_venta = 'finalizada'`, [f.desde, f.hasta, f.id_sucursal]);
    return result.rows[0];
}
async function findSerieVentas(f) {
    const result = await (0, database_1.query)(`SELECT
        v.fecha_venta::text                     AS fecha,
        COALESCE(SUM(v.total_venta), 0)::float8 AS total,
        COUNT(*)::int                           AS cantidad
     FROM ventas v
     JOIN empleados e ON e.id_empleado = v.id_empleado
     WHERE ${FILTRO_VENTAS} AND v.estado_venta = 'finalizada'
     GROUP BY v.fecha_venta
     ORDER BY v.fecha_venta`, [f.desde, f.hasta, f.id_sucursal]);
    return result.rows;
}
async function findVentasPorMetodoPago(f) {
    const result = await (0, database_1.query)(`SELECT
        mp.nombre_metodo_pago                   AS etiqueta,
        COALESCE(SUM(v.total_venta), 0)::float8 AS total,
        COUNT(*)::int                           AS cantidad
     FROM ventas v
     JOIN empleados e ON e.id_empleado = v.id_empleado
     JOIN pagos p ON p.id_pago = v.id_pago
     JOIN metodos_pago mp ON mp.id_metodo_pago = p.id_metodo_pago
     WHERE ${FILTRO_VENTAS} AND v.estado_venta = 'finalizada'
     GROUP BY mp.nombre_metodo_pago
     ORDER BY total DESC`, [f.desde, f.hasta, f.id_sucursal]);
    return result.rows;
}
async function findVentasPorSucursal(f) {
    const result = await (0, database_1.query)(`SELECT
        COALESCE(s.nombre, 'Sin sucursal')      AS etiqueta,
        COALESCE(SUM(v.total_venta), 0)::float8 AS total,
        COUNT(*)::int                           AS cantidad
     FROM ventas v
     JOIN empleados e ON e.id_empleado = v.id_empleado
     LEFT JOIN sucursales s ON s.id_sucursal = e.id_sucursal
     WHERE ${FILTRO_VENTAS} AND v.estado_venta = 'finalizada'
     GROUP BY s.nombre
     ORDER BY total DESC`, [f.desde, f.hasta, f.id_sucursal]);
    return result.rows;
}
async function findTopProductos(f) {
    const result = await (0, database_1.query)(`SELECT
        COALESCE(p.id_producto, ps.id_producto)                       AS id_producto,
        COALESCE(p.nombre_producto, ps.nombre_producto, 'Lente clínico') AS nombre,
        SUM(dv.cantidad)::int                                         AS cantidad,
        COALESCE(SUM(dv.subtotal), 0)::float8                         AS total
     FROM ventas v
     JOIN empleados e ON e.id_empleado = v.id_empleado
     JOIN detalles_venta dv ON dv.id_venta = v.id_venta
     LEFT JOIN productos p ON p.id_producto = dv.id_producto
     LEFT JOIN unidades_serializadas u ON u.id_unidad = dv.id_unidad_serializada
     LEFT JOIN productos ps ON ps.id_producto = u.id_producto
     WHERE ${FILTRO_VENTAS} AND v.estado_venta = 'finalizada'
     GROUP BY 1, 2
     ORDER BY total DESC
     LIMIT 10`, [f.desde, f.hasta, f.id_sucursal]);
    return result.rows;
}
async function findVentasPorEstado(f) {
    const result = await (0, database_1.query)(`SELECT
        v.estado_venta                          AS etiqueta,
        COALESCE(SUM(v.total_venta), 0)::float8 AS total,
        COUNT(*)::int                           AS cantidad
     FROM ventas v
     JOIN empleados e ON e.id_empleado = v.id_empleado
     WHERE ${FILTRO_VENTAS}
     GROUP BY v.estado_venta
     ORDER BY cantidad DESC`, [f.desde, f.hasta, f.id_sucursal]);
    return result.rows;
}
// ─── Compras ───────────────────────────────────────────────────────────────────
async function findResumenCompras(f) {
    const result = await (0, database_1.query)(`SELECT
        COALESCE(SUM(c.total_compra), 0)::float8 AS "totalComprado",
        COUNT(*)::int                            AS "numeroCompras"
     FROM compras c
     JOIN empleados e ON e.id_empleado = c.id_empleado
     WHERE ${FILTRO_COMPRAS} AND c.estado_compra = 'finalizada'`, [f.desde, f.hasta, f.id_sucursal]);
    return result.rows[0];
}
async function findSerieCompras(f) {
    const result = await (0, database_1.query)(`SELECT
        c.fecha_compra::text                    AS fecha,
        COALESCE(SUM(c.total_compra), 0)::float8 AS total,
        COUNT(*)::int                            AS cantidad
     FROM compras c
     JOIN empleados e ON e.id_empleado = c.id_empleado
     WHERE ${FILTRO_COMPRAS} AND c.estado_compra = 'finalizada'
     GROUP BY c.fecha_compra
     ORDER BY c.fecha_compra`, [f.desde, f.hasta, f.id_sucursal]);
    return result.rows;
}
async function findComprasPorProveedor(f) {
    const result = await (0, database_1.query)(`SELECT
        pr.nombre_empresa                        AS etiqueta,
        COALESCE(SUM(c.total_compra), 0)::float8 AS total,
        COUNT(*)::int                            AS cantidad
     FROM compras c
     JOIN empleados e ON e.id_empleado = c.id_empleado
     JOIN proveedores pr ON pr.id_proveedor = c.id_proveedor
     WHERE ${FILTRO_COMPRAS} AND c.estado_compra = 'finalizada'
     GROUP BY pr.nombre_empresa
     ORDER BY total DESC`, [f.desde, f.hasta, f.id_sucursal]);
    return result.rows;
}
async function findComprasPorEstado(f) {
    const result = await (0, database_1.query)(`SELECT
        c.estado_compra                          AS etiqueta,
        COALESCE(SUM(c.total_compra), 0)::float8 AS total,
        COUNT(*)::int                            AS cantidad
     FROM compras c
     JOIN empleados e ON e.id_empleado = c.id_empleado
     WHERE ${FILTRO_COMPRAS}
     GROUP BY c.estado_compra
     ORDER BY cantidad DESC`, [f.desde, f.hasta, f.id_sucursal]);
    return result.rows;
}
// ─── Citas ─────────────────────────────────────────────────────────────────────
async function findResumenCitas(f) {
    const result = await (0, database_1.query)(`SELECT
        COUNT(*)::int                                              AS total,
        COUNT(*) FILTER (WHERE c.estado_cita = 'completada')::int  AS completadas,
        COUNT(*) FILTER (WHERE c.estado_cita = 'cancelada')::int   AS canceladas
     FROM citas c
     LEFT JOIN empleados e ON e.id_empleado = c.id_empleado
     WHERE ${FILTRO_CITAS}`, [f.desde, f.hasta, f.id_sucursal]);
    return result.rows[0];
}
async function findCitasPorEstado(f) {
    const result = await (0, database_1.query)(`SELECT c.estado_cita AS etiqueta, COUNT(*)::int AS cantidad
     FROM citas c
     LEFT JOIN empleados e ON e.id_empleado = c.id_empleado
     WHERE ${FILTRO_CITAS}
     GROUP BY c.estado_cita
     ORDER BY cantidad DESC`, [f.desde, f.hasta, f.id_sucursal]);
    return result.rows;
}
async function findSerieCitas(f) {
    const result = await (0, database_1.query)(`SELECT c.fecha_hora_cita::date::text AS fecha, COUNT(*)::int AS cantidad
     FROM citas c
     LEFT JOIN empleados e ON e.id_empleado = c.id_empleado
     WHERE ${FILTRO_CITAS}
     GROUP BY c.fecha_hora_cita::date
     ORDER BY c.fecha_hora_cita::date`, [f.desde, f.hasta, f.id_sucursal]);
    return result.rows;
}
// ─── Inventario ────────────────────────────────────────────────────────────────
/**
 * Stock unificado por producto/sucursal. Los productos serializados se calculan
 * contando unidades disponibles; los de granel usan `inventario_sucursal`.
 */
const CTE_STOCK = `
  WITH stock AS (
    SELECT
      p.id_producto,
      p.nombre_producto,
      p.precio_venta,
      s.id_sucursal,
      s.nombre AS sucursal,
      CASE WHEN p.tipo_manejo = 'serializado'
           THEN COALESCE((
             SELECT COUNT(*)
             FROM unidades_serializadas u
             WHERE u.id_producto = p.id_producto
               AND u.estado = 'disponible'
               AND (u.id_sucursal = s.id_sucursal OR u.id_sucursal IS NULL)
           ), 0)::int
           ELSE COALESCE(inv.cantidad, 0)
      END AS cantidad,
      COALESCE(inv.stock_minimo, 5)::int AS stock_minimo
    FROM productos p
    CROSS JOIN sucursales s
    LEFT JOIN inventario_sucursal inv
      ON inv.id_producto = p.id_producto AND inv.id_sucursal = s.id_sucursal
    WHERE p.activo = TRUE
      AND s.activa = TRUE
      AND (inv.id_inventario IS NOT NULL OR p.tipo_manejo = 'serializado')
      AND ($1::int IS NULL OR s.id_sucursal = $1)
  )
`;
async function findResumenInventario(f) {
    const result = await (0, database_1.query)(`${CTE_STOCK}
     SELECT
        COUNT(DISTINCT id_producto)::int                 AS "totalProductos",
        COUNT(*) FILTER (WHERE cantidad = 0)::int        AS agotados,
        COUNT(*) FILTER (WHERE cantidad <= stock_minimo)::int AS "stockBajo",
        COALESCE(SUM(cantidad * precio_venta), 0)::float8 AS "valorizacionVenta"
     FROM stock`, [f.id_sucursal]);
    return result.rows[0];
}
async function findStockBajo(f) {
    const result = await (0, database_1.query)(`${CTE_STOCK}
     SELECT
        id_producto,
        nombre_producto,
        sucursal,
        cantidad,
        stock_minimo,
        (stock_minimo - cantidad)::int AS faltante
     FROM stock
     WHERE cantidad <= stock_minimo
     ORDER BY (stock_minimo - cantidad) DESC, nombre_producto
     LIMIT 100`, [f.id_sucursal]);
    return result.rows;
}
async function findInventarioPorSucursal(f) {
    const result = await (0, database_1.query)(`${CTE_STOCK}
     SELECT sucursal AS etiqueta, COALESCE(SUM(cantidad), 0)::int AS cantidad
     FROM stock
     GROUP BY sucursal
     ORDER BY sucursal`, [f.id_sucursal]);
    return result.rows;
}
//# sourceMappingURL=reportes.repository.js.map