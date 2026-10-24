import { z } from 'zod'

// ─── Filtros (Zod) ─────────────────────────────────────────────────────────────
const FechaSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')

export const FiltrosReporteSchema = z.object({
  desde:       FechaSchema.optional(),
  hasta:       FechaSchema.optional(),
  id_sucursal: z.coerce.number().int().positive().optional(),
})
export type FiltrosReporteInput = z.infer<typeof FiltrosReporteSchema>

export const FiltrosInventarioSchema = z.object({
  id_sucursal: z.coerce.number().int().positive().optional(),
})
export type FiltrosInventarioInput = z.infer<typeof FiltrosInventarioSchema>

export const TipoReporteSchema = z.enum(['ventas', 'compras', 'citas', 'inventario'])
export type TipoReporte = z.infer<typeof TipoReporteSchema>

export const FormatoReporteSchema = z.enum(['csv', 'pdf'])
export type FormatoReporte = z.infer<typeof FormatoReporteSchema>

export const ExportQuerySchema = FiltrosReporteSchema.extend({
  tipo:    TipoReporteSchema,
  formato: FormatoReporteSchema.default('csv'),
})
export type ExportQuery = z.infer<typeof ExportQuerySchema>

/** Filtros ya normalizados (fechas resueltas y sucursal nula = todas). */
export interface FiltrosReporte {
  desde:       string
  hasta:       string
  id_sucursal: number | null
}

// ─── Tipos de respuesta ────────────────────────────────────────────────────────
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
    total:            number
    completadas:      number
    canceladas:       number
    tasaCompletadas:  number
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

// ─── Estructuras de exportación ────────────────────────────────────────────────
export interface SeccionExport {
  titulo:   string
  columnas: string[]
  filas:    Array<Array<string | number>>
}

export interface DocumentoExport {
  titulo:    string
  subtitulo: string
  secciones: SeccionExport[]
}
