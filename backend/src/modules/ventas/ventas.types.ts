import { z } from 'zod'

// ─── Tipos de dominio ──────────────────────────────────────────────────────────
export type EstadoVenta = 'en_proceso' | 'finalizada' | 'cancelada'
export type TipoManejo = 'granel' | 'serializado'

// ─── DTOs (Zod) ────────────────────────────────────────────────────────────────
/**
 * Línea del carrito. Para productos granel se usa `cantidad`; para
 * productos serializados se exige `id_unidad_serializada` (una línea por unidad).
 */
export const ItemVentaSchema = z.object({
  id_producto:           z.number().int().positive(),
  cantidad:              z.number().int().positive().default(1),
  id_unidad_serializada: z.number().int().positive().optional().nullable(),
})
export type ItemVentaDto = z.infer<typeof ItemVentaSchema>

export const CrearVentaSchema = z.object({
  id_cliente:           z.number().int().positive(),
  descuento_porcentaje: z.number().min(0, 'El descuento no puede ser negativo').max(100, 'El descuento no puede superar 100%').default(0),
  nota:                 z.string().max(300).optional().nullable(),
  id_metodo_pago:       z.number().int().positive(),
  referencia_pago:      z.string().max(80).optional().nullable(),
  items:                z.array(ItemVentaSchema).min(1, 'La venta debe tener al menos un ítem'),
})
export type CrearVentaDto = z.infer<typeof CrearVentaSchema>

export const RegistrarPagoSchema = z.object({
  id_metodo_pago:  z.number().int().positive(),
  referencia_pago: z.string().max(80).optional().nullable(),
  nota:            z.string().max(300).optional().nullable(),
})
export type RegistrarPagoDto = z.infer<typeof RegistrarPagoSchema>

export const CambiarEstadoVentaSchema = z.object({
  estado: z.enum(['en_proceso', 'finalizada', 'cancelada']),
})
export type CambiarEstadoVentaDto = z.infer<typeof CambiarEstadoVentaSchema>

export const ListarVentasQuerySchema = z.object({
  estado:      z.enum(['en_proceso', 'finalizada', 'cancelada']).optional(),
  busqueda:    z.string().max(60).optional(),
  fecha_desde: z.string().optional(),
  fecha_hasta: z.string().optional(),
})
export type ListarVentasQuery = z.infer<typeof ListarVentasQuerySchema>

// ─── Tipos de respuesta ────────────────────────────────────────────────────────
export interface MetodoPago {
  id_metodo_pago:     number
  nombre_metodo_pago: string
  descripcion:        string | null
  tipo_metodo_pago:   'fisico' | 'electronico' | 'digital'
}

export interface ProductoVendible {
  id_producto:     number
  nombre_producto: string
  tipo_producto:   string
  tipo_manejo:     TipoManejo
  precio_venta:    number
  cantidad:        number
}

export interface UnidadSerializadaVenta {
  id_unidad:    number
  numero_serie: string
  id_producto:  number
}

export interface VentaList {
  id_venta:          number
  fecha_venta:       string
  estado_venta:      EstadoVenta
  subtotal:          number
  descuento_aplicado: number
  total_venta:       number
  id_cliente:        number
  nombre_cliente:    string
  numero_items:      number
}

export interface VentaItem {
  id_detalle_venta: number
  cantidad:         number
  precio_unitario:  number
  subtotal:         number
  nombre_producto:  string
  numero_serie:     string | null
}

export interface PagoVenta {
  id_pago:            number
  monto:              number
  referencia_pago:    string | null
  notas:              string | null
  id_metodo_pago:     number
  nombre_metodo_pago: string
}

export interface VentaDetalle extends VentaList {
  items: VentaItem[]
  pago:  PagoVenta | null
}

export interface ResumenVentas {
  totalVendido: number
  numeroVentas: number
}

export interface CrearVentaResultado {
  id_venta: number
  subtotal: number
  descuento_aplicado: number
  total:    number
  estado:   EstadoVenta
}

// ─── Fila resuelta de ítem (uso interno del repository) ────────────────────────
export interface ItemVentaResuelto {
  id_producto:           number | null
  cantidad:              number
  precio_unitario:       number
  id_unidad_serializada: number | null
}
