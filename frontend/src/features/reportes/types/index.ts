export type TipoReporte = 'ventas' | 'compras' | 'citas' | 'inventario'
export type FormatoReporte = 'csv' | 'pdf'

export interface FiltrosReporte {
  desde:       string
  hasta:       string
  id_sucursal?: number
}

export interface SeriePunto {
  fecha:    string
  total:    number
  cantidad: number
}

export interface SerieCantidad {
  fecha:    string
  cantidad: number
}

export interface GrupoMonto {
  etiqueta: string
  total:    number
  cantidad: number
}

export interface GrupoCantidad {
  etiqueta: string
  cantidad: number
}

export interface TopProducto {
  id_producto: number | null
  nombre:      string
  cantidad:    number
  total:       number
}

export interface ReporteVentas {
  resumen: {
    totalVendido:    number
    numeroVentas:    number
    ticketPromedio:  number
    totalDescuentos: number
    subtotal:        number
  }
  serie:         SeriePunto[]
  porMetodoPago: GrupoMonto[]
  porSucursal:   GrupoMonto[]
  topProductos:  TopProducto[]
  porEstado:     GrupoMonto[]
}

export interface ReporteCompras {
  resumen: {
    totalComprado:  number
    numeroCompras:  number
    ticketPromedio: number
  }
  serie:        SeriePunto[]
  porProveedor: GrupoMonto[]
  porEstado:    GrupoMonto[]
}

export interface ReporteCitas {
  resumen: {
    total:           number
    completadas:     number
    canceladas:      number
    tasaCompletadas: number
  }
  porEstado: GrupoCantidad[]
  serie:     SerieCantidad[]
}

export interface StockBajoItem {
  id_producto:     number
  nombre_producto: string
  sucursal:        string
  cantidad:        number
  stock_minimo:    number
  faltante:        number
}

export interface ReporteInventario {
  resumen: {
    totalProductos:    number
    agotados:          number
    stockBajo:         number
    valorizacionVenta: number
  }
  stockBajo:   StockBajoItem[]
  porSucursal: GrupoCantidad[]
}

// ─── Etiquetas y presets ───────────────────────────────────────────────────────
export const ETIQUETAS_ESTADO: Record<string, string> = {
  en_proceso:             'En proceso',
  finalizada:             'Finalizada',
  cancelada:              'Cancelada',
  confirmada:             'Confirmada',
  reprogramada:           'Reprogramada',
  en_espera_confirmacion: 'En espera',
  completada:             'Completada',
}

export type PresetRango = 'hoy' | '7d' | '30d' | 'mes' | 'personalizado'

export const PRESETS: Array<{ valor: PresetRango; etiqueta: string }> = [
  { valor: 'hoy',    etiqueta: 'Hoy' },
  { valor: '7d',     etiqueta: '7 días' },
  { valor: '30d',    etiqueta: '30 días' },
  { valor: 'mes',    etiqueta: 'Este mes' },
]
