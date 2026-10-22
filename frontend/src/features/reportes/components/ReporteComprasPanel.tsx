import { Tarjeta } from '@/components/ui/Tarjeta'
import { Tabla } from '@/components/ui/Tabla'
import { GraficaBarras } from './GraficaBarras'
import { GraficaLinea } from './GraficaLinea'
import { EstadoReporte } from './EstadoReporte'
import { TarjetasKPI } from './TarjetasKPI'
import { formatearMoneda, formatearNumero } from './formato'
import { ETIQUETAS_ESTADO, type GrupoMonto, type ReporteCompras } from '../types'

interface ReporteComprasPanelProps {
  data?:     ReporteCompras
  isLoading: boolean
}

function recortar(texto: string, maximo = 14): string {
  return texto.length > maximo ? `${texto.slice(0, maximo)}…` : texto
}

export function ReporteComprasPanel({ data, isLoading }: ReporteComprasPanelProps) {
  if (!data) return <EstadoReporte isLoading={isLoading} />

  const serie = data.serie.map((p) => ({ name: p.fecha.slice(5), value: p.total }))
  const proveedores = data.porProveedor.map((g) => ({ name: recortar(g.etiqueta), value: g.total }))

  return (
    <div className="flex flex-col gap-6">
      <TarjetasKPI
        items={[
          { label: 'Total comprado', valor: formatearMoneda(data.resumen.totalComprado), icono: 'shopping_cart' },
          { label: 'Número de compras', valor: formatearNumero(data.resumen.numeroCompras), icono: 'receipt_long' },
          { label: 'Ticket promedio', valor: formatearMoneda(data.resumen.ticketPromedio), icono: 'trending_up' },
        ]}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Tarjeta titulo="Compras por día">
          <GraficaLinea data={serie} moneda color="#00aeef" />
        </Tarjeta>
        <Tarjeta titulo="Compras por proveedor">
          <GraficaBarras data={proveedores} moneda color="#8d4f00" />
        </Tarjeta>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <Tarjeta titulo="Detalle por proveedor">
          <Tabla
            emptyMessage="Sin compras finalizadas en el período."
            data={data.porProveedor}
            columns={[
              { key: 'etiqueta', label: 'Proveedor' },
              {
                key: 'cantidad',
                label: 'Compras',
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

        <Tarjeta titulo="Compras por estado">
          <Tabla
            emptyMessage="Sin compras en el período."
            data={data.porEstado}
            columns={[
              {
                key: 'etiqueta',
                label: 'Estado',
                render: (row: GrupoMonto) => ETIQUETAS_ESTADO[row.etiqueta] ?? row.etiqueta,
              },
              {
                key: 'cantidad',
                label: 'Compras',
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
    </div>
  )
}
