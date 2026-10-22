import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, type ApiResponse } from '@/lib/api'
import type { Sucursal } from '@/features/sucursales/types'
import { BarraFiltros } from '../components/BarraFiltros'
import { BotonExportar } from '../components/BotonExportar'
import { ReporteCitasPanel } from '../components/ReporteCitasPanel'
import { ReporteComprasPanel } from '../components/ReporteComprasPanel'
import { ReporteInventarioPanel } from '../components/ReporteInventarioPanel'
import { ReporteVentasPanel } from '../components/ReporteVentasPanel'
import { useReporteCitas, useReporteCompras, useReporteInventario, useReporteVentas } from '../hooks/useReportes'
import { rangoPreset } from '../lib/fechas'
import type { FiltrosReporte, PresetRango, TipoReporte } from '../types'

const TABS: Array<{ valor: TipoReporte; etiqueta: string; icono: string }> = [
  { valor: 'ventas',     etiqueta: 'Ventas',     icono: 'payments' },
  { valor: 'compras',    etiqueta: 'Compras',    icono: 'shopping_cart' },
  { valor: 'citas',      etiqueta: 'Citas',      icono: 'calendar_month' },
  { valor: 'inventario', etiqueta: 'Inventario', icono: 'inventory_2' },
]

const RANGO_INICIAL = rangoPreset('mes')

export default function PaginaReportes() {
  const [tab, setTab] = useState<TipoReporte>('ventas')
  const [preset, setPreset] = useState<PresetRango>('mes')
  const [desde, setDesde] = useState(RANGO_INICIAL.desde)
  const [hasta, setHasta] = useState(RANGO_INICIAL.hasta)
  const [idSucursal, setIdSucursal] = useState('')

  const { data: sucursalesResponse } = useQuery({
    queryKey: ['sucursales'],
    queryFn: () => api.get<ApiResponse<Sucursal[]>>('/sucursales'),
  })
  const sucursales = sucursalesResponse?.data ?? []

  const filtros = useMemo<FiltrosReporte>(() => ({
    desde,
    hasta,
    ...(idSucursal ? { id_sucursal: Number(idSucursal) } : {}),
  }), [desde, hasta, idSucursal])

  const ventasQuery = useReporteVentas(filtros, tab === 'ventas')
  const comprasQuery = useReporteCompras(filtros, tab === 'compras')
  const citasQuery = useReporteCitas(filtros, tab === 'citas')
  const inventarioQuery = useReporteInventario(filtros, tab === 'inventario')

  function aplicarPreset(nuevo: Exclude<PresetRango, 'personalizado'>) {
    const rango = rangoPreset(nuevo)
    setPreset(nuevo)
    setDesde(rango.desde)
    setHasta(rango.hasta)
  }

  return (
    <div className="p-8 flex flex-col gap-6 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-headline font-extrabold text-2xl text-on-surface">Reportes</h1>
          <p className="text-outline text-sm mt-1">
            Análisis de ventas, compras, citas e inventario con exportación.
          </p>
        </div>
        <BotonExportar tipo={tab} filtros={filtros} />
      </div>

      <div className="inline-flex flex-wrap rounded-2xl bg-surface-container p-1 self-start">
        {TABS.map((t) => (
          <button
            key={t.valor}
            type="button"
            onClick={() => setTab(t.valor)}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all
              ${tab === t.valor ? 'bg-white text-primary shadow-ambient' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            <span className="material-symbols-outlined text-[18px]">{t.icono}</span>
            {t.etiqueta}
          </button>
        ))}
      </div>

      <BarraFiltros
        desde={desde}
        hasta={hasta}
        preset={preset}
        idSucursal={idSucursal}
        sucursales={sucursales}
        onPreset={aplicarPreset}
        onDesde={(valor) => { setDesde(valor); setPreset('personalizado') }}
        onHasta={(valor) => { setHasta(valor); setPreset('personalizado') }}
        onSucursal={setIdSucursal}
      />

      {tab === 'ventas' && (
        <ReporteVentasPanel data={ventasQuery.data?.data} isLoading={ventasQuery.isLoading} />
      )}
      {tab === 'compras' && (
        <ReporteComprasPanel data={comprasQuery.data?.data} isLoading={comprasQuery.isLoading} />
      )}
      {tab === 'citas' && (
        <ReporteCitasPanel data={citasQuery.data?.data} isLoading={citasQuery.isLoading} />
      )}
      {tab === 'inventario' && (
        <ReporteInventarioPanel data={inventarioQuery.data?.data} isLoading={inventarioQuery.isLoading} />
      )}
    </div>
  )
}
