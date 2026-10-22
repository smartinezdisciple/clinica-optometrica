import { query, withTransaction } from '../../config/database'
import type { PoolClient } from 'pg'
import { AppError } from '../../middleware/manejo-errores'
import type {
  CrearProductoDto,
  ProductoInventarioDb,
  UnidadSerializadaDb,
} from './inventario.types'

/**
 * Obtiene el catálogo de productos activos de la sucursal (granel y serializados).
 * Para productos serializados, la cantidad mostrada es el conteo de unidades
 * disponibles; para granel, el valor de `inventario_sucursal.cantidad`.
 */
export async function findProductosInventario(sucursalId: number): Promise<ProductoInventarioDb[]> {
  const result = await query<ProductoInventarioDb>(
    `SELECT
        p.id_producto,
        ROW_NUMBER() OVER (ORDER BY p.nombre_producto)::text AS enumeracion,
        p.nombre_producto,
        p.tipo_producto,
        p.tipo_manejo,
        p.precio_venta,
        CASE WHEN p.tipo_manejo = 'serializado'
             THEN COALESCE(cant_serial.cnt, 0)
             ELSE COALESCE(inv.cantidad, 0)
        END AS cantidad,
        CASE WHEN p.tipo_manejo = 'serializado' THEN NULL ELSE inv.cantidad END AS cantidad_granel,
        CASE WHEN p.tipo_manejo = 'serializado' THEN COALESCE(cant_serial.cnt, 0) ELSE NULL END AS cantidad_serializada,
        e.nombres || ' ' || e.apellidos AS ingresado_por,
        m.fecha_movimiento AS fecha_ingreso,
        mo.marca
      FROM productos p
      LEFT JOIN inventario_sucursal inv
        ON inv.id_producto = p.id_producto AND inv.id_sucursal = $1
      LEFT JOIN LATERAL (
        SELECT COUNT(*) AS cnt
        FROM unidades_serializadas u2
        WHERE u2.id_producto = p.id_producto
          AND u2.estado = 'disponible'
          AND (u2.id_sucursal = $1 OR u2.id_sucursal IS NULL)
      ) cant_serial ON TRUE
      LEFT JOIN LATERAL (
        SELECT mi.id_usuario, mi.fecha_movimiento
        FROM movimientos_inventario mi
        WHERE mi.id_producto = p.id_producto
          AND mi.tipo_movimiento = 'entrada'
        ORDER BY mi.fecha_movimiento DESC
        LIMIT 1
      ) m ON TRUE
      LEFT JOIN usuarios u ON u.id_usuario = m.id_usuario
      LEFT JOIN empleados e ON e.id_empleado = u.id_empleado
      LEFT JOIN marcos_oftalmologicos mo ON mo.id_producto = p.id_producto
      WHERE p.activo = TRUE
      ORDER BY p.nombre_producto`,
    [sucursalId]
  )
  return result.rows
}

/**
 * Obtiene las unidades serializadas de un producto en la sucursal, con su estado.
 */
export async function findUnidadesByProducto(
  sucursalId: number,
  productoId: number
): Promise<UnidadSerializadaDb[]> {
  const result = await query<UnidadSerializadaDb>(
    `SELECT
        u.id_unidad,
        u.numero_serie,
        u.estado,
        u.fecha_ingreso,
        u.fecha_venta,
        u.id_sucursal,
        s.nombre AS nombre_sucursal
      FROM unidades_serializadas u
      LEFT JOIN sucursales s ON s.id_sucursal = u.id_sucursal
      WHERE u.id_producto = $1
        AND (u.id_sucursal = $2 OR u.id_sucursal IS NULL)
      ORDER BY u.fecha_ingreso DESC, u.id_unidad DESC`,
    [productoId, sucursalId]
  )
  return result.rows
}

/**
 * Verifica que un producto exista y devuelve su tipo de manejo.
 */
export async function findProductoManejo(productoId: number): Promise<string | null> {
  const result = await query<{ tipo_manejo: string; nombre_producto: string }>(
    'SELECT tipo_manejo, nombre_producto FROM productos WHERE id_producto = $1',
    [productoId]
  )
  return result.rows[0]?.tipo_manejo ?? null
}

export function findProductoById(productoId: number): Promise<boolean> {
  return query<{ id_producto: number }>(
    'SELECT id_producto FROM productos WHERE id_producto = $1',
    [productoId]
  ).then((r) => r.rows.length > 0)
}

/**
 * Crea un producto en transacción. Para granel registra stock inicial;
 * para serializado registra las unidades iniciales (número de serie).
 * Devuelve el id y el conteo de unidades creadas.
 */
export async function createProductoInTx(
  dto: CrearProductoDto,
  sucursalId: number,
  usuarioId: number
): Promise<{ idProducto: number; unidadesCreadas: number }> {
  return withTransaction(async (client: PoolClient) => {
    const insert = await client.query<{ id_producto: number }>(
      `INSERT INTO productos
          (nombre_producto, codigo_producto, descripcion_producto, tipo_producto, tipo_manejo, precio_venta, precio_compra)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id_producto`,
      [
        dto.nombre_producto,
        dto.codigo_producto ?? null,
        dto.descripcion_producto ?? null,
        dto.tipo_producto,
        dto.tipo_manejo,
        dto.precio_venta,
        dto.precio_compra ?? null,
      ]
    )
    const idProducto = insert.rows[0].id_producto

    if (dto.tipo_producto === 'marco_oftalmologico') {
      await client.query(
        `INSERT INTO marcos_oftalmologicos (marca, id_producto) VALUES ($1, $2)`,
        [dto.marca ?? null, idProducto]
      )
    }

    let unidadesCreadas = 0
    if (dto.tipo_manejo === 'granel' && (dto.stock_inicial ?? 0) > 0) {
      await sumarStockGrand(client, idProducto, sucursalId, dto.stock_inicial!, 'Stock inicial', usuarioId)
    } else if (dto.tipo_manejo === 'serializado' && dto.seriales && dto.seriales.length > 0) {
      unidadesCreadas = await insertSeriales(client, idProducto, sucursalId, dto.seriales)
    }

    return { idProducto, unidadesCreadas }
  })
}

/**
 * Registra unidades serializadas de un producto ya existente (ingreso directo).
 */
export async function insertSerialesByProducto(
  productoId: number,
  sucursalId: number,
  seriales: string[]
): Promise<number> {
  return withTransaction(async (client: PoolClient) => insertSeriales(client, productoId, sucursalId, seriales))
}

/**
 * Inserta unidades serializadas dentro de una transacción ya abierta.
 * Lanza la excepción nativa de Postgres (unique_violation) que el service traduce.
 */
async function insertSeriales(
  client: PoolClient,
  productoId: number,
  sucursalId: number,
  seriales: string[]
): Promise<number> {
  const ids: number[] = []
  for (const serie of seriales) {
    const r = await client.query<{ id_unidad: number }>(
      `INSERT INTO unidades_serializadas (numero_serie, estado, id_producto, id_sucursal)
       VALUES ($1, 'disponible', $2, $3)
       RETURNING id_unidad`,
      [serie, productoId, sucursalId]
    )
    ids.push(r.rows[0].id_unidad)
  }
  return ids.length
}

/**
 * Suma stock de un producto granel (upsert en inventario_sucursal + movimiento).
 */
async function sumarStockGrand(
  client: PoolClient,
  productoId: number,
  sucursalId: number,
  cantidad: number,
  motivo: string,
  usuarioId: number
): Promise<void> {
  await client.query(
    `INSERT INTO inventario_sucursal (id_producto, id_sucursal, cantidad)
     VALUES ($1, $2, $3)
     ON CONFLICT (id_producto, id_sucursal)
     DO UPDATE SET cantidad = inventario_sucursal.cantidad + EXCLUDED.cantidad`,
    [productoId, sucursalId, cantidad]
  )
  await client.query(
    `INSERT INTO movimientos_inventario (tipo_movimiento, cantidad, motivo, id_producto, id_sucursal, id_usuario)
     VALUES ('entrada', $1, $2, $3, $4, $5)`,
    [cantidad, motivo, productoId, sucursalId, usuarioId]
  )
}

/**
 * Registra un movimiento de inventario para productos granel.
 * - entrada:     +cantidad
 * - salida/perdida: -cantidad (requiere stock suficiente)
 * - ajuste:      cantidad con signo (positivo suma, negativo resta)
 */
export async function crearMovimientoGranelInTx(
  productoId: number,
  sucursalId: number,
  usuarioId: number,
  tipoMovimiento: 'entrada' | 'salida' | 'ajuste' | 'perdida',
  cantidad: number,
  motivo: string | null
): Promise<void> {
  await withTransaction(async (client: PoolClient) => {
    if (tipoMovimiento === 'entrada' && cantidad <= 0) {
      throw new AppError(400, 'Una entrada requiere una cantidad positiva')
    }
    if ((tipoMovimiento === 'salida' || tipoMovimiento === 'perdida') && cantidad <= 0) {
      throw new AppError(400, 'Una salida o pérdida requiere una cantidad positiva')
    }

    let delta = cantidad
    if (tipoMovimiento === 'salida' || tipoMovimiento === 'perdida') delta = -cantidad

    if (delta < 0) {
      const stock = await client.query<{ cantidad: number }>(
        `SELECT cantidad FROM inventario_sucursal
         WHERE id_producto = $1 AND id_sucursal = $2`,
        [productoId, sucursalId]
      )
      const disponible = stock.rows[0]?.cantidad ?? 0
      if (disponible + delta < 0) {
        throw new AppError(409, `Stock insuficiente. Disponible: ${disponible}, requerido: ${-delta}`)
      }
    }

    await client.query(
      `INSERT INTO movimientos_inventario (tipo_movimiento, cantidad, motivo, id_producto, id_sucursal, id_usuario)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [tipoMovimiento, delta, motivo, productoId, sucursalId, usuarioId]
    )

    await aplicarDeltaStock(client, productoId, sucursalId, delta)
  })
}

/**
 * Suma (o resta) un delta al stock de la sucursal sin duplicar el registro.
 */
async function aplicarDeltaStock(client: PoolClient, productoId: number, sucursalId: number, delta: number): Promise<void> {
  await client.query(
    `INSERT INTO inventario_sucursal (id_producto, id_sucursal, cantidad)
     VALUES ($1, $2, $3)
     ON CONFLICT (id_producto, id_sucursal)
     DO UPDATE SET cantidad = inventario_sucursal.cantidad + EXCLUDED.cantidad`,
    [productoId, sucursalId, delta]
  )
}