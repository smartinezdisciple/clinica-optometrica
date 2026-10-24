import { Tarjeta } from '@/components/ui/Tarjeta'
import { Tabla } from '@/components/ui/Tabla'
import { GraficaBarras } from './GraficaBarras'
import { GraficaLinea } from './GraficaLinea'
import { EstadoReporte } from './EstadoReporte'
import { TarjetasKPI } from './TarjetasKPI'
import { formatearNumero } from './formato'
import { ETIQUETAS_ESTADO, type GrupoCantidad, type ReporteCitas } from '../types'

interface ReporteCitasPanelProps {
  data?:     ReporteCitas
  isLoading: boolean
}

export function ReporteCitasPanel({ data, isLoading }: ReporteCitasPanelProps) {
  if (!data) return <EstadoReporte isLoading={isLoading} />

  const estados = data.porEstado.map((g) => ({
    name: ETIQUETAS_ESTADO[g.etiqueta] ?? g.etiqueta,
    value: g.cantidad,
  }))
  const serie = data.serie.map((p) => ({ name: p.fecha.slice(5), value: p.cantidad }))

  return (
    <div className="flex flex-col gap-6">
      <TarjetasKPI
        items={[
          { label: 'Total de citas', valor: formatearNumero(data.resumen.total), icono: 'calendar_month' },
          {
            label: 'Completadas',
            valor: formatearNumero(data.resumen.completadas),
            icono: 'task_alt',
            tono: 'exito',
          },
          {
            label: 'Canceladas',
            valor: formatearNumero(data.resumen.canceladas),
            icono: 'event_busy',
            tono: 'error',
          },
          {
            label: 'Tasa de completadas',
            valor: `${data.resumen.tasaCompletadas.toFixed(1)}%`,
            icono: 'donut_large',
          },
        ]}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Tarjeta titulo="Citas por estado">
          <GraficaBarras data={estados} color="#7c3aed" />
        </Tarjeta>
        <Tarjeta titulo="Citas por día">
          <GraficaLinea data={serie} color="#7c3aed" />
        </Tarjeta>
      </div>

      <Tarjeta titulo="Detalle por estado">
        <Tabla
          emptyMessage="Sin citas en el período."
          data={data.porEstado}
          columns={[
            {
              key: 'etiqueta',
              label: 'Estado',
              render: (row: GrupoCantidad) => ETIQUETAS_ESTADO[row.etiqueta] ?? row.etiqueta,
            },
            {
              key: 'cantidad',
              label: 'Cantidad',
              className: 'text-right',
              render: (row: GrupoCantidad) => formatearNumero(row.cantidad),
            },
          ]}
        />
      </Tarjeta>
    </div>
  )
}
