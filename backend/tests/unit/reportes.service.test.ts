import { describe, expect, it, vi, beforeEach, afterEach, Mocked } from 'vitest'

vi.mock('../../src/modules/reportes/reportes.repository', () => ({
  findResumenVentas: vi.fn(),
  findSerieVentas: vi.fn(),
  findVentasPorMetodoPago: vi.fn(),
  findVentasPorSucursal: vi.fn(),
  findTopProductos: vi.fn(),
  findVentasPorEstado: vi.fn(),
  findResumenCompras: vi.fn(),
  findSerieCompras: vi.fn(),
  findComprasPorProveedor: vi.fn(),
  findComprasPorEstado: vi.fn(),
  findResumenCitas: vi.fn(),
  findCitasPorEstado: vi.fn(),
  findSerieCitas: vi.fn(),
  findResumenInventario: vi.fn(),
  findStockBajo: vi.fn(),
  findInventarioPorSucursal: vi.fn(),
}))

import * as repo from '../../src/modules/reportes/reportes.repository'
import {
  getReporteCitas,
  getReporteInventario,
  getReporteVentas,
  normalizarFiltros,
} from '../../src/modules/reportes/reportes.service'

const mockRepo = repo as Mocked<typeof repo>

describe('reportes.service — normalizarFiltros', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-21T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('usa el mes actual cuando no se envían fechas', () => {
    const filtros = normalizarFiltros({})
    expect(filtros.desde).toBe('2026-10-01')
    expect(filtros.hasta).toBe('2026-10-21')
    expect(filtros.id_sucursal).toBeNull()
  })

  it('rechaza un rango invertido', () => {
    expect(() => normalizarFiltros({ desde: '2026-10-21', hasta: '2026-10-01' }))
      .toThrow('La fecha "desde" no puede ser posterior a "hasta"')
  })

  it('rechaza una fecha inexistente', () => {
    expect(() => normalizarFiltros({ desde: '2026-02-31', hasta: '2026-03-01' }))
      .toThrow('Fecha "desde" inválida')
  })
})

describe('reportes.service — ventas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRepo.findResumenVentas.mockResolvedValue({
      totalVendido: 6300,
      numeroVentas: 2,
      totalDescuentos: 700,
      subtotal: 7000,
    })
    mockRepo.findSerieVentas.mockResolvedValue([])
    mockRepo.findVentasPorMetodoPago.mockResolvedValue([])
    mockRepo.findVentasPorSucursal.mockResolvedValue([])
    mockRepo.findTopProductos.mockResolvedValue([])
    mockRepo.findVentasPorEstado.mockResolvedValue([])
  })

  it('calcula el ticket promedio y propaga los filtros', async () => {
    const reporte = await getReporteVentas({
      desde: '2026-10-01',
      hasta: '2026-10-21',
      id_sucursal: 1,
    })

    expect(reporte.resumen.ticketPromedio).toBe(3150)
    expect(mockRepo.findResumenVentas).toHaveBeenCalledWith({
      desde: '2026-10-01',
      hasta: '2026-10-21',
      id_sucursal: 1,
    })
  })

  it('evita dividir entre cero cuando no hay ventas', async () => {
    mockRepo.findResumenVentas.mockResolvedValue({
      totalVendido: 0,
      numeroVentas: 0,
      totalDescuentos: 0,
      subtotal: 0,
    })

    const reporte = await getReporteVentas({ desde: '2026-10-01', hasta: '2026-10-21' })
    expect(reporte.resumen.ticketPromedio).toBe(0)
    expect(mockRepo.findResumenVentas).toHaveBeenCalledWith(
      expect.objectContaining({ id_sucursal: null })
    )
  })
})

describe('reportes.service — citas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRepo.findResumenCitas.mockResolvedValue({ total: 4, completadas: 3, canceladas: 1 })
    mockRepo.findCitasPorEstado.mockResolvedValue([])
    mockRepo.findSerieCitas.mockResolvedValue([])
  })

  it('calcula la tasa de citas completadas', async () => {
    const reporte = await getReporteCitas({ desde: '2026-10-01', hasta: '2026-10-21' })
    expect(reporte.resumen.tasaCompletadas).toBe(75)
  })
})

describe('reportes.service — inventario', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRepo.findResumenInventario.mockResolvedValue({
      totalProductos: 6,
      agotados: 1,
      stockBajo: 2,
      valorizacionVenta: 100000,
    })
    mockRepo.findStockBajo.mockResolvedValue([])
    mockRepo.findInventarioPorSucursal.mockResolvedValue([])
  })

  it('consulta todas las sucursales cuando no se filtra', async () => {
    const reporte = await getReporteInventario({})
    expect(reporte.resumen.totalProductos).toBe(6)
    expect(mockRepo.findResumenInventario).toHaveBeenCalledWith(
      expect.objectContaining({ id_sucursal: null })
    )
  })
})
