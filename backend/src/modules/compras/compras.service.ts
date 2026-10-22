import * as repo from './compras.repository'
import { AppError } from '../../middleware/manejo-errores'
import { query } from '../../config/database'
import type {
  CompraDetalle,
  CompraList,
  CrearCompraDto,
  CrearProveedorDto,
  ItemCompra,
  Proveedor,
} from './compras.types'

// ─── Proveedores ───────────────────────────────────────────────────────────────
export async function getProveedoresList(): Promise<Proveedor[]> {
  return repo.findProveedores()
}

export async function createProveedor(dto: CrearProveedorDto): Promise<Proveedor> {
  return repo.insertProveedor(dto)
}

// ─── Compras ───────────────────────────────────────────────────────────────────
export async function getComprasList(): Promise<CompraList[]> {
  return repo.findCompras()
}

export async function getCompra(idCompra: number): Promise<CompraDetalle> {
  const compra = await repo.findCompraById(idCompra)
  if (!compra) throw new AppError(404, 'La compra no existe')
  return compra
}

/**
 * Resuelve el empleado ligado al usuario autenticado (requerido por `compras.id_empleado`).
 */
async function resolveEmpleadoId(usuarioId: number): Promise<number> {
  const result = await query<{ id_empleado: number }>(
    'SELECT id_empleado FROM usuarios WHERE id_usuario = $1',
    [usuarioId]
  )
  if (!result.rows[0]) {
    throw new AppError(400, 'El usuario no tiene un empleado asociado para registrar compras')
  }
  return result.rows[0].id_empleado
}

export async function createCompra(dto: CrearCompraDto, usuarioId: number, sucursalId: number) {
  const empleadoId = await resolveEmpleadoId(usuarioId)
  try {
    return await repo.createCompraInTx({
      empleadoId,
      sucursalId,
      proveedorId:   dto.id_proveedor,
      observaciones: dto.observaciones ?? null,
      recibida:      dto.recibida,
      items:         dto.items,
    })
  } catch (err) {
    throw traducirErrorInventario(err)
  }
}

export async function addItems(idCompra: number, items: ItemCompra[], sucursalId: number) {
  try {
    const agregados = await repo.agregarItemsInTx(idCompra, sucursalId, items)
    return {
      id_compra: idCompra,
      items: agregados,
      compra: await repo.findCompraById(idCompra),
    }
  } catch (err) {
    throw traducirErrorInventario(err)
  }
}

export async function changeCompraEstado(idCompra: number, estado: 'en_proceso' | 'finalizada' | 'cancelada'): Promise<void> {
  await repo.updateEstadoCompra(idCompra, estado)
}

/**
 * Traduce errores de BD (duplicación de seriales) y reenvía los controlados.
 */
function traducirErrorInventario(err: unknown): never {
  if (err instanceof AppError) throw err
  const code = (err as { code?: string } | null)?.code
  if (code === '23505') {
    throw new AppError(409, 'Uno o más números de serie ya están registrados en el sistema')
  }
  throw err
}