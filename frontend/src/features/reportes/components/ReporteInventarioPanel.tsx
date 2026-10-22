import { Insignia } from '@/components/ui/Insignia'
import { Tarjeta } from '@/components/ui/Tarjeta'
import { Tabla } from '@/components/ui/Tabla'
import { GraficaBarras } from './GraficaBarras'
import { EstadoReporte } from './EstadoReporte'
import { TarjetasKPI } from './TarjetasKPI'
import { formatearMoneda, formatearNumero } from './formato'
import type { ReporteInventario, StockBajoItem } from '../types'

interface ReporteInventarioPanelProps {
  data?:     ReporteInventario
  isLoading: boolean
}

export function ReporteInventarioPanel({ data, isLoading }: ReporteInventarioPanelProps) {
  if (!data) return <EstadoReporte isLoading={isLoading} />

  const sucursales = data.porSucursal.map((g) => ({ name: g.etiqueta, value: g.cantidad }))

  return (
    <div className="flex flex-col gap-6">
      <TarjetasKPI
        items={[
          { label: 'Productos activos', valor: formatearNumero(data.resumen.totalProductos), icono: 'inventory_2' },
          {
            label: 'Agotados',
            valor: formatearNumero(data.resumen.agotados),
            icono: 'production_quantity_limits',
            tono: 'error',
          },
          {
            label: 'Registros con stock bajo',
            valor: formatearNumero(data.resumen.stockBajo),
            icono: 'warning',
            tono: 'advertencia',
          },
          {
            label: 'Valorización (venta)',
            valor: formatearMoneda(data.resumen.valorizacionVenta),
            icono: 'paid',
          },
        ]}
      />

      <Tarjeta titulo="Unidades por sucursal">
        <GraficaBarras data={sucursales} color="#059669" />
      </Tarjeta>

      <Tarjeta titulo="Stock bajo mínimo">
        <Tabla
          emptyMessage="No hay productos por debajo del stock mínimo."
          data={data.stockBajo}
          columns={[
            { key: 'nombre_producto', label: 'Producto' },
            { key: 'sucursal', label: 'Sucursal' },
            {
              key: 'cantidad',
              label: 'Cantidad',
              className: 'text-center',
              render: (row: StockBajoItem) => formatearNumero(row.cantidad),
            },
            {
              key: 'stock_minimo',
              label: 'Mínimo',
              className: 'text-center',
              render: (row: StockBajoItem) => formatearNumero(row.stock_minimo),
            },
            {
              key: 'faltante',
              label: 'Faltante',
              className: 'text-center',
              render: (row: StockBajoItem) => (
                <span className="font-bold text-on-surface">{formatearNumero(row.faltante)}</span>
              ),
            },
            {
              key: 'estado',
              label: 'Estado',
              render: (row: StockBajoItem) => (
                row.cantidad === 0
                  ? <Insignia variant="error">Agotado</Insignia>
                  : <Insignia variant="advertencia">Bajo</Insignia>
              ),
            },
          ]}
        />
      </Tarjeta>
    </div>
  )
}
