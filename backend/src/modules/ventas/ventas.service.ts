import * as repo from './ventas.repository'
import { query } from '../../config/database'
import { AppError } from '../../middleware/manejo-errores'
import type {
  CrearVentaDto,
  CrearVentaResultado,
  EstadoVenta,
  ItemVentaResuelto,
  ListarVentasQuery,
  MetodoPago,
  ProductoVendible,
  ResumenVentas,
  UnidadSerializadaVenta,
  VentaDetalle,
  VentaList,
} from './ventas.types'

// ─── Catálogos ─────────────────────────────────────────────────────────────────
export async function getMetodosPago(): Promise<MetodoPago[]> {
  return repo.findMetodosPago()
}

export async function getProductosVendibles(sucursalId: number): Promise<ProductoVendible[]> {
  return repo.findProductosVendibles(sucursalId)
}

export async function getSerialesDisponibles(
  productoId: number,
  sucursalId: number
): Promise<UnidadSerializadaVenta[]> {
  return repo.findSerialesDisponibles(productoId, sucursalId)
}

// ─── Consultas ─────────────────────────────────────────────────────────────────
export async function getVentas(filtros: ListarVentasQuery): Promise<VentaList[]> {
  return repo.findVentas(filtros)
}

export async function getVenta(idVenta: number): Promise<VentaDetalle> {
  const venta = await repo.findVentaById(idVenta)
  if (!venta) throw new AppError(404, 'La venta no existe')
  return venta
}

export async function getResumen(filtros: ListarVentasQuery): Promise<ResumenVentas> {
  return repo.getResumenVentas(filtros)
}

// ─── Creación de venta ─────────────────────────────────────────────────────────
/**
 * Resuelve el empleado ligado al usuario autenticado (requerido por
 * `ventas.id_empleado`; además el trigger de inventario usa la sucursal del empleado).
 */
async function resolveEmpleadoId(usuarioId: number): Promise<number> {
  const result = await query<{ id_empleado: number }>(
    'SELECT id_empleado FROM usuarios WHERE id_usuario = $1',
    [usuarioId]
  )
  if (!result.rows[0]?.id_empleado) {
    throw new AppError(400, 'El usuario no tiene un empleado asociado para registrar ventas')
  }
  return result.rows[0].id_empleado
}

/**
 * Registra una venta finalizada con su pago.
 *
 * Valida cliente, método de pago y cada ítem (existencia, stock y unidades
 * serializadas disponibles). El inventario y los totales los calcula la BD.
 */
export async function crearVenta(
  dto: CrearVentaDto,
  usuarioId: number,
  sucursalId: number
): Promise<CrearVentaResultado> {
  const empleadoId = await resolveEmpleadoId(usuarioId)

  const metodo = await repo.findMetodoPagoActivo(dto.id_metodo_pago)
  if (!metodo) throw new AppError(400, 'El método de pago no existe o está inactivo')

  if (!(await repo.existeCliente(dto.id_cliente))) {
    throw new AppError(400, 'El cliente seleccionado no existe')
  }

  const items = await resolverItems(dto.items, sucursalId)

  const suma = items.reduce((acc, it) => acc + it.cantidad * it.precio_unitario, 0)
  const descuentoAplicado = redondear(suma * (dto.descuento_porcentaje / 100))

  try {
    return await repo.createVentaInTx({
      clienteId:         dto.id_cliente,
      empleadoId,
      usuarioId,
      sucursalId,
      descuentoAplicado,
      nota:              dto.nota ?? null,
      metodoPagoId:      dto.id_metodo_pago,
      referenciaPago:    dto.referencia_pago ?? null,
      items,
    })
  } catch (err) {
    throw traducirErrorVenta(err)
  }
}

/**
 * Resuelve y valida cada línea del carrito contra el catálogo y el stock.
 * - Granel: valida stock disponible (sumando cantidades repetidas por producto).
 * - Serializado: exige una unidad disponible del producto solicitado.
 */
async function resolverItems(
  items: CrearVentaDto['items'],
  sucursalId: number
): Promise<ItemVentaResuelto[]> {
  const resueltos: ItemVentaResuelto[] = []
  const requeridoGranel = new Map<number, { cantidad: number; nombre: string }>()

  for (const item of items) {
    const producto = await repo.findProductoVenta(item.id_producto)
    if (!producto) throw new AppError(404, `El producto ${item.id_producto} no existe`)
    if (!producto.activo) throw new AppError(400, `El producto '${producto.nombre_producto}' está inactivo`)

    if (producto.tipo_manejo === 'granel') {
      const acumulado = requeridoGranel.get(item.id_producto)
      if (acumulado) {
        acumulado.cantidad += item.cantidad
      } else {
        requeridoGranel.set(item.id_producto, { cantidad: item.cantidad, nombre: producto.nombre_producto })
      }
      resueltos.push({
        id_producto:           item.id_producto,
        cantidad:              item.cantidad,
        precio_unitario:       producto.precio_venta,
        id_unidad_serializada: null,
      })
      continue
    }

    // Serializado: una línea por unidad
    if (!item.id_unidad_serializada) {
      throw new AppError(400, `El producto serializado '${producto.nombre_producto}' requiere seleccionar una unidad`)
    }
    const unidad = await repo.findUnidadVenta(item.id_unidad_serializada)
    if (!unidad) throw new AppError(404, 'La unidad serializada no existe')
    if (unidad.id_producto !== item.id_producto) {
      throw new AppError(400, 'La unidad serializada no corresponde al producto seleccionado')
    }
    if (unidad.estado !== 'disponible') {
      throw new AppError(409, `La unidad ${item.id_unidad_serializada} no está disponible`)
    }

    resueltos.push({
      id_producto:           null,
      cantidad:              1,
      precio_unitario:       producto.precio_venta,
      id_unidad_serializada: item.id_unidad_serializada,
    })
  }

  // Verificación previa de stock granel (el trigger valida de forma definitiva)
  for (const [idProducto, { cantidad, nombre }] of requeridoGranel) {
    const stock = await repo.getStockGranel(idProducto, sucursalId)
    if (stock < cantidad) {
      throw new AppError(409, `Stock insuficiente de '${nombre}'. Disponible: ${stock}, solicitado: ${cantidad}`)
    }
  }

  return resueltos
}

// ─── Cambio de estado ──────────────────────────────────────────────────────────
export async function cambiarEstadoVenta(
  idVenta: number,
  estado: EstadoVenta,
  usuarioId: number
): Promise<void> {
  await repo.updateEstadoVenta(idVenta, estado, usuarioId)
}

// ─── Utilidades ────────────────────────────────────────────────────────────────
function redondear(valor: number): number {
  return Math.round(valor * 100) / 100
}

/**
 * Traduce errores de BD a respuestas controladas.
 * - 23505 unique_violation
 * - 23514 check_violation
 * - P0001 raise_exception (triggers de stock)
 */
function traducirErrorVenta(err: unknown): never {
  if (err instanceof AppError) throw err
  const code = (err as { code?: string; message?: string } | null)?.code
  if (code === '23505') {
    throw new AppError(409, 'Conflicto de datos al registrar la venta')
  }
  if (code === '23514') {
    throw new AppError(409, 'Los datos de la venta no cumplen las reglas del sistema')
  }
  if (code === 'P0001') {
    const mensaje = (err as { message?: string }).message ?? 'No se pudo completar la venta'
    throw new AppError(409, mensaje)
  }
  throw err
}
