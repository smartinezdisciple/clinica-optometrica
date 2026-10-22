import { Tarjeta } from '@/components/ui/Tarjeta'
import { Tabla } from '@/components/ui/Tabla'
import { GraficaLinea } from './GraficaLinea'
import { GraficaPastel } from './GraficaPastel'
import { EstadoReporte } from './EstadoReporte'
import { TarjetasKPI } from './TarjetasKPI'
import { formatearMoneda, formatearNumero } from './formato'
import { ETIQUETAS_ESTADO, type GrupoMonto, type ReporteVentas, type TopProducto } from '../types'

interface ReporteVentasPanelProps {
  data?:     ReporteVentas
  isLoading: boolean
}

export function ReporteVentasPanel({ data, isLoading }: ReporteVentasPanelProps) {
  if (!data) return <EstadoReporte isLoading={isLoading} />

  const serie = data.serie.map((p) => ({ name: p.fecha.slice(5), value: p.total }))
  const metodos = data.porMetodoPago.map((g) => ({ name: g.etiqueta, value: g.total }))

  return (
    <div className="flex flex-col gap-6">
      <TarjetasKPI
        items={[
          { label: 'Total vendido', valor: formatearMoneda(data.resumen.totalVendido), icono: 'payments' },
          { label: 'Número de ventas', valor: formatearNumero(data.resumen.numeroVentas), icono: 'receipt_long' },
          { label: 'Ticket promedio', valor: formatearMoneda(data.resumen.ticketPromedio), icono: 'trending_up' },
          {
            label: 'Descuentos aplicados',
            valor: formatearMoneda(data.resumen.totalDescuentos),
            icono: 'local_offer',
            tono: 'advertencia',
          },
        ]}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Tarjeta titulo="Ventas por día">
          <GraficaLinea data={serie} moneda />
        </Tarjeta>
        <Tarjeta titulo="Ventas por método de pago">
          <GraficaPastel data={metodos} moneda />
        </Tarjeta>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <Tarjeta titulo="Productos más vendidos">
          <Tabla
            emptyMessage="Sin productos vendidos en el período."
            data={data.topProductos}
            columns={[
              { key: 'nombre', label: 'Producto' },
              {
                key: 'cantidad',
                label: 'Cantidad',
                className: 'text-center',
                render: (row: TopProducto) => formatearNumero(row.cantidad),
              },
              {
                key: 'total',
                label: 'Total',
                className: 'text-right',
                render: (row: TopProducto) => (
                  <span className="font-bold text-primary">{formatearMoneda(row.total)}</span>
                ),
              },
            ]}
          />
        </Tarjeta>

        <Tarjeta titulo="Ventas por sucursal">
          <Tabla
            emptyMessage="Sin ventas en el período."
            data={data.porSucursal}
            columns={[
              { key: 'etiqueta', label: 'Sucursal' },
              {
                key: 'cantidad',
                label: 'Ventas',
                className: 'text-center',
                render: (row: GrupoMonto) => formatearNumero(row.cantidad),
              },
              {
                key: 'total',
                label: 'Total',
                className: 'text-right',
                render: (row: GrupoMonto) => (
                  <span className="font-bold text-primary">{formatearMoneda(row.total)}</span>
                ),
              },
            ]}
          />
        </Tarjeta>
      </div>

      <Tarjeta titulo="Ventas por estado">
        <Tabla
          emptyMessage="Sin ventas en el período."
          data={data.porEstado}
          columns={[
            {
              key: 'etiqueta',
              label: 'Estado',
              render: (row: GrupoMonto) => ETIQUETAS_ESTADO[row.etiqueta] ?? row.etiqueta,
            },
            {
              key: 'cantidad',
              label: 'Ventas',
              className: 'text-center',
              render: (row: GrupoMonto) => formatearNumero(row.cantidad),
            },
            {
              key: 'total',
              label: 'Total',
              className: 'text-right',
              render: (row: GrupoMonto) => formatearMoneda(row.total),
            },
          ]}
        />
      </Tarjeta>
    </div>
  )
}
