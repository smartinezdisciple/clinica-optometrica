// ─── Tipos del módulo de Ventas (POS) ─────────────────────────────────────────
export type EstadoVenta = 'en_proceso' | 'finalizada' | 'cancelada'
export type TipoManejo = 'granel' | 'serializado'
export type TipoMetodoPago = 'fisico' | 'electronico' | 'digital'

// ─── Catálogos auxiliares ─────────────────────────────────────────────────────
export interface MetodoPago {
  id_metodo_pago:     number
  nombre_metodo_pago: string
  descripcion:        string | null
  tipo_metodo_pago:   TipoMetodoPago
}

export interface ProductoVendible {
  id_producto:     number
  nombre_producto: string
  tipo_producto:   string
  tipo_manejo:     TipoManejo
  precio_venta:    number
  cantidad:        number
}

export interface UnidadSerializada {
  id_unidad:    number
  numero_serie: string
  id_producto:  number
}

// ─── Venta (listado / detalle) ────────────────────────────────────────────────
export interface Venta {
  id_venta:           number
  fecha_venta:        string
  estado_venta:       EstadoVenta
  subtotal:           number
  descuento_aplicado: number
  total_venta:        number
  id_cliente:         number
  nombre_cliente:     string
  numero_items:       number
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

export interface VentaDetalle extends Venta {
  items: VentaItem[]
  pago:  PagoVenta | null
}

export interface ResumenVentas {
  totalVendido: number
  numeroVentas: number
}

export interface CrearVentaResultado {
  id_venta:           number
  subtotal:           number
  descuento_aplicado: number
  total:              number
  estado:             EstadoVenta
}

// ─── Tipos de UI ──────────────────────────────────────────────────────────────
export interface ClienteVenta {
  id_cliente: number
  nombre:     string
  tipo:       'Persona' | 'Empresa'
}

/**
 * Línea del carrito en el POS. Los productos serializados generan una línea por
 * cada unidad física (cantidad fija = 1 y `id_unidad_serializada` presente).
 */
export interface ItemCarrito {
  uid:                   string
  id_producto:           number
  nombre_producto:       string
  tipo_manejo:           TipoManejo
  precio_unitario:       number
  cantidad:              number
  stock:                 number
  id_unidad_serializada: number | null
  numero_serie:          string | null
}

export interface ItemVentaPayload {
  id_producto:           number
  cantidad:              number
  id_unidad_serializada: number | null
}

export interface CrearVentaPayload {
  id_cliente:           number
  descuento_porcentaje: number
  nota:                 string | null
  id_metodo_pago:       number
  referencia_pago:      string | null
  items:                ItemVentaPayload[]
}

/** Datos formateados para renderizar el comprobante tras cobrar. */
export interface ReciboData {
  id_venta:   number
  fecha:      string
  cliente:    string
  metodo:     string
  items:      {
    nombre_producto:       string
    cantidad:              number
    precio_unitario:       number
    subtotal:              number
    numero_serie:          string | null
  }[]
  subtotal:   number
  descuento:  number
  total:      number
  recibido?:  number
  cambio?:    number
}

// ─── Mapas de presentación ────────────────────────────────────────────────────
export const ESTADO_VENTA_VARIANT: Record<EstadoVenta, 'exito' | 'advertencia' | 'error'> = {
  finalizada: 'exito',
  en_proceso: 'advertencia',
  cancelada:  'error',
}

export const ESTADO_VENTA_LABEL: Record<EstadoVenta, string> = {
  finalizada: 'Finalizada',
  en_proceso: 'En proceso',
  cancelada:  'Cancelada',
}

export const TIPO_METODO_PAGO_LABEL: Record<TipoMetodoPago, string> = {
  fisico:     'Efectivo',
  electronico: 'Tarjeta / Transferencia',
  digital:    'Pago digital',
}
