import { query, withTransaction } from '../../config/database'
import type { PoolClient } from 'pg'
import { AppError } from '../../middleware/manejo-errores'
import type {
  CompraDetalle,
  CompraList,
  CrearProveedorDto,
  DetalleCompra,
  ItemCompra,
  Proveedor,
} from './compras.types'

// ─── Proveedores ───────────────────────────────────────────────────────────────
export async function findProveedores(): Promise<Proveedor[]> {
  const result = await query<Proveedor>(
    `SELECT id_proveedor, nombre_empresa, nombre_contacto, telefono, correo, direccion, ruc, activo
     FROM proveedores WHERE activo = TRUE ORDER BY nombre_empresa`
  )
  return result.rows
}

export async function insertProveedor(dto: CrearProveedorDto): Promise<Proveedor> {
  const result = await query<Proveedor>(
    `INSERT INTO proveedores (nombre_empresa, nombre_contacto, telefono, correo, direccion, ruc)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id_proveedor, nombre_empresa, nombre_contacto, telefono, correo, direccion, ruc, activo`,
    [dto.nombre_empresa, dto.nombre_contacto ?? null, dto.telefono ?? null, dto.correo ?? null, dto.direccion ?? null, dto.ruc ?? null]
  )
  return result.rows[0]
}

// ─── Compras (listado) ─────────────────────────────────────────────────────────
export async function findCompras(): Promise<CompraList[]> {
  const result = await query<CompraList>(
    `SELECT
        c.id_compra,
        c.fecha_compra::text AS fecha_compra,
        c.estado_compra,
        c.total_compra,
        c.observaciones,
        c.id_proveedor,
        pr.nombre_empresa,
        COUNT(dc.id_detalle_compra)::int AS numero_items
      FROM compras c
      JOIN proveedores pr ON pr.id_proveedor = c.id_proveedor
      LEFT JOIN detalles_compra dc ON dc.id_compra = c.id_compra
      GROUP BY c.id_compra, pr.nombre_empresa
      ORDER BY c.id_compra DESC`
  )
  return result.rows
}

export async function findCompraById(idCompra: number): Promise<CompraDetalle | null> {
  const head = await query<CompraList>(
    `SELECT
        c.id_compra,
        c.fecha_compra::text AS fecha_compra,
        c.estado_compra,
        c.total_compra,
        c.observaciones,
        c.id_proveedor,
        pr.nombre_empresa,
        (SELECT COUNT(*)::int FROM detalles_compra dc2 WHERE dc2.id_compra = c.id_compra) AS numero_items
      FROM compras c
      JOIN proveedores pr ON pr.id_proveedor = c.id_proveedor
      WHERE c.id_compra = $1`,
    [idCompra]
  )
  if (head.rows.length === 0) return null

  const detalles = await query<DetalleCompra>(
    `SELECT
        dc.id_detalle_compra,
        dc.cantidad,
        dc.precio_unitario,
        dc.subtotal,
        dc.id_producto,
        p.nombre_producto,
        p.tipo_manejo,
        COALESCE((
          SELECT ARRAY(SELECT u.numero_serie::text FROM unidades_serializadas u
                       WHERE u.id_detalle_compra = dc.id_detalle_compra
                       ORDER BY u.numero_serie)
        ), '{}') AS seriales
      FROM detalles_compra dc
      JOIN productos p ON p.id_producto = dc.id_producto
      WHERE dc.id_compra = $1
      ORDER BY dc.id_detalle_compra`,
    [idCompra]
  )

  return { ...head.rows[0], items: detalles.rows }
}

// ─── Alta de compra con ítems (transacción) ────────────────────────────────────
export interface CrearCompraParams {
  empleadoId:  number
  sucursalId:  number
  proveedorId: number
  observaciones: string | null
  recibida:    boolean
  items:       ItemCompra[]
}

export interface ResultadoItem {
  id_producto:     number
  nombre_producto: string
  tipo_manejo:     string
  cantidad:        number
  unidadesCreadas: number
}

export interface ResultadoCompra {
  id_compra: number
  estado:    string
  total:     number
  items:     ResultadoItem[]
}

/**
 * Crea la compra con sus ítems en una sola transacción.
 * - Inserta/actualiza productos nuevos.
 * - Inserta detalles_compra (el trigger de la BD suma el inventario granel).
 * - Para serializados, registra las unidades con su número de serie.
 */
export async function createCompraInTx(params: CrearCompraParams): Promise<ResultadoCompra> {
  return withTransaction(async (client: PoolClient) => {
    const compra = await client.query<{ id_compra: number }>(
      `INSERT INTO compras (estado_compra, observaciones, id_proveedor, id_empleado)
       VALUES ($1, $2, $3, $4)
       RETURNING id_compra`,
      [
        params.recibida ? 'finalizada' : 'en_proceso',
        params.observaciones,
        params.proveedorId,
        params.empleadoId,
      ]
    )
    const idCompra = compra.rows[0].id_compra

    const items: ResultadoItem[] = []
    for (const item of params.items) {
      const resuelto = await resolverItem(client, item)
      const detalle = await client.query<{ id_detalle_compra: number; subtotal: number }>(
        `INSERT INTO detalles_compra (cantidad, precio_unitario, id_compra, id_producto)
         VALUES ($1, $2, $3, $4)
         RETURNING id_detalle_compra, subtotal`,
        [resuelto.cantidad, item.precio_unitario, idCompra, resuelto.idProducto]
      )

      // Unidades serializadas (vinculadas al detalle de compra)
      let unidadesCreadas = 0
      if (resuelto.tipoManejo === 'serializado') {
        unidadesCreadas = await insertarUnidades(
          client,
          resuelto.idProducto,
          params.sucursalId,
          detalle.rows[0].id_detalle_compra,
          resuelto.seriales
        )
      }

      items.push({
        id_producto:     resuelto.idProducto,
        nombre_producto: resuelto.nombreProducto,
        tipo_manejo:     resuelto.tipoManejo,
        cantidad:        resuelto.cantidad,
        unidadesCreadas,
      })
    }

    const total = await client.query<{ total_compra: number }>(
      'SELECT total_compra FROM compras WHERE id_compra = $1',
      [idCompra]
    )

    return {
      id_compra: idCompra,
      estado:    params.recibida ? 'finalizada' : 'en_proceso',
      total:     Number(total.rows[0].total_compra),
      items,
    }
  })
}

/**
 * Añade ítems a una compra existente en estado 'en_proceso'.
 */
export async function agregarItemsInTx(
  idCompra: number,
  sucursalId: number,
  items: ItemCompra[]
): Promise<ResultadoItem[]> {
  return withTransaction(async (client: PoolClient) => {
    const estado = await client.query<{ estado_compra: string }>(
      'SELECT estado_compra FROM compras WHERE id_compra = $1',
      [idCompra]
    )
    if (estado.rows.length === 0) throw new AppError(404, 'La compra no existe')
    if (estado.rows[0].estado_compra !== 'en_proceso') {
      throw new AppError(409, 'Solo se pueden añadir ítems a una compra en proceso')
    }

    const result: ResultadoItem[] = []
    for (const item of items) {
      const resuelto = await resolverItem(client, item)
      const detalle = await client.query<{ id_detalle_compra: number }>(
        `INSERT INTO detalles_compra (cantidad, precio_unitario, id_compra, id_producto)
         VALUES ($1, $2, $3, $4)
         RETURNING id_detalle_compra`,
        [resuelto.cantidad, item.precio_unitario, idCompra, resuelto.idProducto]
      )
      let unidadesCreadas = 0
      if (resuelto.tipoManejo === 'serializado') {
        unidadesCreadas = await insertarUnidades(
          client,
          resuelto.idProducto,
          sucursalId,
          detalle.rows[0].id_detalle_compra,
          resuelto.seriales
        )
      }
      result.push({
        id_producto:     resuelto.idProducto,
        nombre_producto: resuelto.nombreProducto,
        tipo_manejo:     resuelto.tipoManejo,
        cantidad:        resuelto.cantidad,
        unidadesCreadas,
      })
    }
    return result
  })
}

/**
 * Resuelve el ítem a un id de producto concreto:
 * - Si trae `nuevoProducto`, lo crea (sin stock, el trigger lo agrega aquí).
 * - Si trae `id_producto`, valida existencia y tipo de manejo.
 * Determina cantidad y seriales según tipo de manejo.
 */
async function resolverItem(
  client: PoolClient,
  item: ItemCompra
): Promise<{ idProducto: number; nombreProducto: string; tipoManejo: 'granel' | 'serializado'; cantidad: number; seriales: string[] }> {
  let idProducto: number
  let nombreProducto: string
  let tipoManejo: 'granel' | 'serializado'

  if (item.nuevoProducto) {
    const nuevo = item.nuevoProducto
    const insert = await client.query<{ id_producto: number }>(
      `INSERT INTO productos
          (nombre_producto, codigo_producto, descripcion_producto, tipo_producto, tipo_manejo, precio_venta, precio_compra)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id_producto`,
      [nuevo.nombre_producto, nuevo.codigo_producto ?? null, nuevo.descripcion_producto ?? null,
       nuevo.tipo_producto, nuevo.tipo_manejo, nuevo.precio_venta, nuevo.precio_compra ?? null]
    )
    idProducto  = insert.rows[0].id_producto
    nombreProducto = nuevo.nombre_producto
    tipoManejo  = nuevo.tipo_manejo

    if (nuevo.tipo_producto === 'marco_oftalmologico') {
      await client.query(
        `INSERT INTO marcos_oftalmologicos (marca, id_producto) VALUES ($1, $2)`,
        [nuevo.marca ?? null, idProducto]
      )
    }
  } else {
    const existente = await client.query<{ id_producto: number; nombre_producto: string; tipo_manejo: string }>(
      'SELECT id_producto, nombre_producto, tipo_manejo FROM productos WHERE id_producto = $1',
      [item.id_producto]
    )
    if (existente.rows.length === 0) throw new AppError(404, `El producto ${item.id_producto} no existe`)
    idProducto  = existente.rows[0].id_producto
    nombreProducto = existente.rows[0].nombre_producto
    tipoManejo  = existente.rows[0].tipo_manejo as 'granel' | 'serializado'
  }

  // Validación según tipo de manejo
  if (tipoManejo === 'granel') {
    if (!item.cantidad) throw new AppError(400, `Granel '${nombreProducto}' requiere una cantidad`)
    return { idProducto, nombreProducto, tipoManejo, cantidad: item.cantidad, seriales: [] }
  }

  const seriales = (item.seriales ?? []).map((s) => s.trim()).filter(Boolean)
  if (seriales.length === 0) {
    throw new AppError(400, `Serializado '${nombreProducto}' requiere al menos un número de serie`)
  }
  if (new Set(seriales).size !== seriales.length) {
    throw new AppError(400, `Existen números de serie duplicados en '${nombreProducto}'`)
  }
  return { idProducto, nombreProducto, tipoManejo, cantidad: seriales.length, seriales }
}

/**
 * Inserta unidades serializadas vinculadas al detalle de compra.
 * Lanza unique_violation (23505) si un serial ya existe — el service la traduce.
 */
async function insertarUnidades(
  client: PoolClient,
  productoId: number,
  sucursalId: number,
  idDetalleCompra: number,
  seriales: string[]
): Promise<number> {
  let n = 0
  for (const serie of seriales) {
    await client.query(
      `INSERT INTO unidades_serializadas (numero_serie, estado, id_producto, id_sucursal, id_detalle_compra)
       VALUES ($1, 'disponible', $2, $3, $4)`,
      [serie, productoId, sucursalId, idDetalleCompra]
    )
    n++
  }
  return n
}

/**
 * Cambia el estado de una compra.
 */
export async function updateEstadoCompra(idCompra: number, estado: string): Promise<void> {
  const result = await query(
    `UPDATE compras SET estado_compra = $1 WHERE id_compra = $2`,
    [estado, idCompra]
  )
  if (result.rowCount === 0) throw new AppError(404, 'La compra no existe')
}