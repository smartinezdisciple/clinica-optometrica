import * as repo from './inventario.repository'
import { AppError } from '../../middleware/manejo-errores'
import type {
  CrearProductoDto,
  ProductoInventario,
  ProductoInventarioDb,
  RegistrarMovimientoDto,
  TipoManejo,
  UnidadSerializadaDb,
} from './inventario.types'

const TIPO_MAP: Record<string, string> = {
  marco_oftalmologico: 'Marco oftalmológico',
  gafas_sol: 'Gafas de sol',
  accesorio: 'Accesorio',
  lente_comercial: 'Lente comercial',
}

const MANEJO_MAP: Record<TipoManejo, string> = {
  granel: 'Granel',
  serializado: 'Serializado',
}

/**
 * Listado del catálogo con etiquetas amigables para el frontend.
 */
export async function getProductosInventario(sucursalId: number): Promise<ProductoInventario[]> {
  const productos = await repo.findProductosInventario(sucursalId)
  return mapProductos(productos)
}

function mapProductos(rows: ProductoInventarioDb[]): ProductoInventario[] {
  return rows.map((p) => ({
    ...p,
    tipo_producto_label: TIPO_MAP[p.tipo_producto] ?? p.tipo_producto,
    tipo_manejo_label:  MANEJO_MAP[p.tipo_manejo] ?? p.tipo_manejo,
  }))
}

/**
 * Unidades serializadas de un producto (con estado y sucursal).
 */
export async function getUnidadesSerializadas(productoId: number, sucursalId: number): Promise<UnidadSerializadaDb[]> {
  return repo.findUnidadesByProducto(sucursalId, productoId)
}

/**
 * Alta de un nuevo producto en el catálogo (granel o serializado).
 */
export async function crearProducto(dto: CrearProductoDto, sucursalId: number, usuarioId: number) {
  try {
    const { idProducto, unidadesCreadas } = await repo.createProductoInTx(dto, sucursalId, usuarioId)
    const productos = await repo.findProductosInventario(sucursalId)
    const creado = productos.find((p) => p.id_producto === idProducto)
    if (!creado) {
      throw new AppError(500, 'No se pudo recuperar el producto creado')
    }
    return { producto: mapProductos([creado])[0], unidadesCreadas }
  } catch (err) {
    throw traducirErrorSeriales(err)
  }
}

/**
 * Registro de unidades serializadas adicionales (ingreso directo en inventario).
 */
export async function registrarSeriales(productoId: number, seriales: string[], sucursalId: number) {
  const manejo = await repo.findProductoManejo(productoId)
  if (manejo === null) {
    throw new AppError(404, 'El producto no existe')
  }
  if (manejo !== 'serializado') {
    throw new AppError(400, 'Este producto es de tipo granel; no requiere números de serie')
  }

  const limpios = [...new Set(seriales.map((s) => s.trim()))]
  if (limpios.length !== seriales.length) {
    throw new AppError(400, 'Existen números de serie duplicados en la lista')
  }

  try {
    const creadas = await repo.insertSerialesByProducto(productoId, sucursalId, limpios)
    return { unidadesCreadas: creadas }
  } catch (err) {
    throw traducirErrorSeriales(err)
  }
}

/**
 * Registro de movimiento de inventario (granel). Rechaza productos serializados,
 * cuyos cambios de existencia se manejan por unidades (seriales).
 */
export async function registrarMovimiento(dto: RegistrarMovimientoDto, sucursalId: number, usuarioId: number) {
  const manejo = await repo.findProductoManejo(dto.id_producto)
  if (manejo === null) {
    throw new AppError(404, 'El producto no existe')
  }
  if (manejo !== 'granel') {
    throw new AppError(400, 'Los productos serializados usan unidades; registra seriales en lugar de movimientos')
  }

  await repo.crearMovimientoGranelInTx(
    dto.id_producto,
    sucursalId,
    usuarioId,
    dto.tipo_movimiento,
    dto.cantidad,
    dto.motivo ?? null
  )
}

/**
 * Traduce el error Postgres de unicidad (duplicado) a un 409 controlado.
 */
function traducirErrorSeriales(err: unknown): void {
  if (err instanceof AppError) throw err
  // error code 23505 = unique_violation
  const code = (err as { code?: string } | null)?.code
  if (code === '23505') {
    throw new AppError(409, 'Uno o más números de serie ya están registrados en el sistema')
  }
  throw err
}