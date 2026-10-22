import type { FiltrosReporte, PresetRango } from '../types'

/** Devuelve una fecha local en formato YYYY-MM-DD (sin desfase por zona horaria). */
export function fechaISO(fecha: Date): string {
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`
}

function sumarDias(fecha: Date, dias: number): Date {
  const copia = new Date(fecha)
  copia.setDate(copia.getDate() + dias)
  return copia
}

/**
 * Calcula el rango de fechas de un preset relativo a `hoy`.
 * `7d` y `30d` incluyen el día de hoy.
 */
export function rangoPreset(
  preset: Exclude<PresetRango, 'personalizado'>,
  hoy: Date = new Date()
): { desde: string; hasta: string } {
  const hasta = fechaISO(hoy)

  switch (preset) {
    case 'hoy':
      return { desde: hasta, hasta }
    case '7d':
      return { desde: fechaISO(sumarDias(hoy, -6)), hasta }
    case '30d':
      return { desde: fechaISO(sumarDias(hoy, -29)), hasta }
    case 'mes': {
      const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
      return { desde: fechaISO(inicio), hasta }
    }
  }
}

/** Serializa filtros (y extras) como query string para los endpoints de reportes. */
export function construirQuery(
  filtros: FiltrosReporte,
  extra: Record<string, string> = {}
): string {
  const params = new URLSearchParams()

  if (filtros.desde) params.set('desde', filtros.desde)
  if (filtros.hasta) params.set('hasta', filtros.hasta)
  if (filtros.id_sucursal != null) params.set('id_sucursal', String(filtros.id_sucursal))

  for (const [clave, valor] of Object.entries(extra)) {
    params.set(clave, valor)
  }

  return params.toString()
}
