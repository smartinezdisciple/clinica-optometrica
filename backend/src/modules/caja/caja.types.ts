import { z } from 'zod'

// ─── Caja ──────────────────────────────────────────────────────────────────────
export interface Caja {
  id_caja:     number
  nombre_caja: string
  id_sucursal: number
  activa:      boolean
}

export const CrearCajaSchema = z.object({
  nombre_caja: z.string().min(1, 'El nombre de la caja es requerido').max(30),
})
export type CrearCajaDto = z.infer<typeof CrearCajaSchema>

export const CambiarEstadoCajaSchema = z.object({
  activa: z.boolean(),
})

// ─── Apertura ──────────────────────────────────────────────────────────────────
export const AperturaSchema = z.object({
  monto_inicial: z.number().min(0, 'El monto inicial no puede ser negativo'),
  observaciones: z.string().max(300).optional().nullable(),
})
export type AperturaDto = z.infer<typeof AperturaSchema>

export interface AperturaActiva {
  id_apertura:    number
  fecha_apertura: string
  monto_inicial:  number
  observaciones:  string | null
}

// ─── Movimientos ───────────────────────────────────────────────────────────────
export const MovimientoCajaSchema = z.object({
  tipo_movimiento: z.enum(['ingreso', 'egreso', 'ajuste']),
  monto:           z.number().positive('El monto debe ser mayor a 0'),
  descripcion:     z.string().max(300).optional().nullable(),
})
export type MovimientoCajaDto = z.infer<typeof MovimientoCajaSchema>

export interface MovimientoCaja {
  id_movimiento:    number
  tipo_movimiento:  'ingreso' | 'egreso' | 'ajuste'
  monto:            number
  descripcion:      string | null
  fecha_movimiento: string
  id_usuario:       number
  nombre_usuario:   string | null
}

// ─── Cierre ────────────────────────────────────────────────────────────────────
export const CierreCajaSchema = z.object({
  monto_final:   z.number().min(0, 'El monto final no puede ser negativo'),
  observaciones: z.string().max(300).optional().nullable(),
})
export type CierreCajaDto = z.infer<typeof CierreCajaSchema>

export interface ResumenCaja {
  aperturaActiva: AperturaActiva | null
  montoInicial:   number
  totalIngresos:  number
  totalEgresos:   number
  totalAjustes:   number
  saldoEsperado:  number
}