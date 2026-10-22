import { describe, it, expect } from 'vitest'
import { construirQuery, fechaISO, rangoPreset } from './fechas'

const HOY = new Date(2026, 9, 21)

describe('fechaISO', () => {
  it('formatea con ceros a la izquierda', () => {
    expect(fechaISO(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('rangoPreset', () => {
  it('hoy incluye solo el día actual', () => {
    expect(rangoPreset('hoy', HOY)).toEqual({ desde: '2026-10-21', hasta: '2026-10-21' })
  })

  it('7d incluye hoy y los 6 días previos', () => {
    expect(rangoPreset('7d', HOY)).toEqual({ desde: '2026-10-15', hasta: '2026-10-21' })
  })

  it('30d incluye hoy y los 29 días previos', () => {
    expect(rangoPreset('30d', HOY)).toEqual({ desde: '2026-09-22', hasta: '2026-10-21' })
  })

  it('mes inicia el primer día del mes', () => {
    expect(rangoPreset('mes', HOY)).toEqual({ desde: '2026-10-01', hasta: '2026-10-21' })
  })
})

describe('construirQuery', () => {
  it('incluye fechas y sucursal cuando están presentes', () => {
    const query = construirQuery({ desde: '2026-10-01', hasta: '2026-10-21', id_sucursal: 2 })
    expect(query).toBe('desde=2026-10-01&hasta=2026-10-21&id_sucursal=2')
  })

  it('omite valores vacíos y agrega extras', () => {
    const query = construirQuery({ desde: '', hasta: '2026-10-21' }, { formato: 'csv' })
    expect(query).toBe('hasta=2026-10-21&formato=csv')
  })
})
