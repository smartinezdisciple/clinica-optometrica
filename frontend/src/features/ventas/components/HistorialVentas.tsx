import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, type ApiResponse, ApiHttpError } from '@/lib/api'
import { Tarjeta } from '@/components/ui/Tarjeta'
import { Tabla } from '@/components/ui/Tabla'
import { Insignia } from '@/components/ui/Insignia'
import { Boton } from '@/components/ui/Boton'
import { BarraBusqueda } from '@/components/ui/BarraBusqueda'
import { Modal } from '@/components/ui/Modal'
import { CargadorIris } from '@/components/ui/CargadorIris'
import {
  ESTADO_VENTA_LABEL,
  ESTADO_VENTA_VARIANT,
  type EstadoVenta,
  type ResumenVentas,
  type Venta,
  type VentaDetalle,
} from '../types'

function formatearMoneda(valor: number): string {
  return `₡${valor.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const ESTADOS: { valor: EstadoVenta | ''; etiqueta: string }[] = [
  { valor: '',           etiqueta: 'Todas' },
  { valor: 'finalizada', etiqueta: 'Finalizadas' },
  { valor: 'en_proceso', etiqueta: 'En proceso' },
  { valor: 'cancelada',  etiqueta: 'Canceladas' },
]

/**
 * Historial de ventas con filtros, KPIs y gestión de estado (cancelación con
 * reversión de inventario del lado del servidor).
 */
export function HistorialVentas() {
  const queryClient = useQueryClient()

  const [estado, setEstado] = useState<EstadoVenta | ''>('')
  const [busqueda, setBusqueda] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const [detalleId, setDetalleId] = useState<number | null>(null)

  const filtros = useMemo(() => {
    const params = new URLSearchParams()
    if (estado) params.set('estado', estado)
    if (busqueda.trim()) params.set('busqueda', busqueda.trim())
    if (fechaDesde) params.set('fecha_desde', fechaDesde)
    if (fechaHasta) params.set('fecha_hasta', fechaHasta)
    return params.toString()
  }, [estado, busqueda, fechaDesde, fechaHasta])

  const { data: ventasResponse, isLoading } = useQuery({
    queryKey: ['ventas', filtros],
    queryFn: () => api.get<ApiResponse<Venta[]>>(`/ventas${filtros ? `?${filtros}` : ''}`),
  })
  const ventas = ventasResponse?.data ?? []

  const { data: resumenResponse } = useQuery({
    queryKey: ['ventas-resumen', filtros],
    queryFn: () => api.get<ApiResponse<ResumenVentas>>(`/ventas/resumen${filtros ? `?${filtros}` : ''}`),
  })
  const resumen = resumenResponse?.data ?? { totalVendido: 0, numeroVentas: 0 }

  const { data: detalleResponse, isLoading: cargandoDetalle } = useQuery({
    queryKey: ['venta-detalle', detalleId],
    queryFn: () => api.get<ApiResponse<VentaDetalle>>(`/ventas/${detalleId}`),
    enabled: detalleId != null,
  })
  const detalle = detalleResponse?.data ?? null

  const cancelarMutation = useMutation({
    mutationFn: (id: number) => api.patch<ApiResponse<void>>(`/ventas/${id}/estado`, { estado: 'cancelada' }),
    onSuccess: () => {
      toast.success('Venta cancelada y inventario revertido')
      queryClient.invalidateQueries({ queryKey: ['ventas'] })
      queryClient.invalidateQueries({ queryKey: ['ventas-resumen'] })
      queryClient.invalidateQueries({ queryKey: ['venta-detalle'] })
    },
    onError: (err) => {
      const mensaje = err instanceof ApiHttpError ? err.body.error : 'No se pudo cancelar la venta'
      toast.error(mensaje)
    },
  })

  function confirmarCancelacion(venta: Venta) {
    if (window.confirm(`¿Cancelar la venta #${venta.id_venta}? Se revertirá el inventario.`)) {
      cancelarMutation.mutate(venta.id_venta)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Tarjeta className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">payments</span>
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Total vendido</p>
            <p className="text-2xl font-extrabold text-on-surface">{formatearMoneda(resumen.totalVendido)}</p>
          </div>
        </Tarjeta>
        <Tarjeta className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">receipt_long</span>
          </div>
          <div>
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Número de ventas</p>
            <p className="text-2xl font-extrabold text-on-surface">{resumen.numeroVentas}</p>
          </div>
        </Tarjeta>
      </div>

      <Tarjeta>
        <div className="flex flex-wrap items-end gap-3 mb-5">
          <BarraBusqueda
            id="historial-busqueda"
            placeholder="Buscar por cliente…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="historial-desde" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Desde
            </label>
            <input
              id="historial-desde"
              type="date"
              value={fechaDesde}
              onChange={(e) => setFechaDesde(e.target.value)}
              className="bg-surface-container-low border border-transparent rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="historial-hasta" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Hasta
            </label>
            <input
              id="historial-hasta"
              type="date"
              value={fechaHasta}
              onChange={(e) => setFechaHasta(e.target.value)}
              className="bg-surface-container-low border border-transparent rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30"
            />
          </div>
          <div className="flex flex-wrap gap-2 ml-auto">
            {ESTADOS.map((e) => (
              <button
                key={e.valor || 'todas'}
                type="button"
                onClick={() => setEstado(e.valor)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all
                  ${estado === e.valor
                    ? 'bg-primary text-white shadow-primary-glow'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                {e.etiqueta}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 flex justify-center"><CargadorIris /></div>
        ) : (
          <Tabla
            onRowClick={(row: Venta) => setDetalleId(row.id_venta)}
            emptyMessage="No hay ventas registradas."
            columns={[
              { key: 'id_venta', label: '# Venta', render: (row: Venta) => `#${row.id_venta}` },
              {
                key: 'fecha_venta',
                label: 'Fecha',
                render: (row: Venta) => new Date(row.fecha_venta).toLocaleString('es-CR'),
              },
              { key: 'nombre_cliente', label: 'Cliente' },
              { key: 'numero_items', label: 'Ítems', className: 'text-center' },
              {
                key: 'total_venta',
                label: 'Total',
                render: (row: Venta) => <span className="font-bold text-primary">{formatearMoneda(row.total_venta)}</span>,
              },
              {
                key: 'estado_venta',
                label: 'Estado',
                render: (row: Venta) => (
                  <Insignia variant={ESTADO_VENTA_VARIANT[row.estado_venta]}>
                    {ESTADO_VENTA_LABEL[row.estado_venta]}
                  </Insignia>
                ),
              },
              {
                key: 'acciones',
                label: '',
                className: 'text-right',
                render: (row: Venta) =>
                  row.estado_venta !== 'cancelada' ? (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); confirmarCancelacion(row) }}
                      disabled={cancelarMutation.isPending}
                      className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
                    >
                      Cancelar
                    </button>
                  ) : null,
              },
            ]}
            data={ventas}
          />
        )}
      </Tarjeta>

      <Modal
        isOpen={detalleId != null}
        onClose={() => setDetalleId(null)}
        titulo={detalle ? `Venta #${detalle.id_venta}` : 'Detalle de venta'}
        maxWith="lg"
      >
        {cargandoDetalle || !detalle ? (
          <div className="py-12 flex justify-center"><CargadorIris /></div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <span className="text-on-surface-variant">
                Cliente: <span className="font-semibold text-on-surface">{detalle.nombre_cliente}</span>
              </span>
              <span className="text-on-surface-variant">
                Fecha: <span className="font-semibold text-on-surface">{new Date(detalle.fecha_venta).toLocaleString('es-CR')}</span>
              </span>
              <Insignia variant={ESTADO_VENTA_VARIANT[detalle.estado_venta]}>
                {ESTADO_VENTA_LABEL[detalle.estado_venta]}
              </Insignia>
            </div>

            <div className="rounded-2xl border border-surface-container overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-surface-container-low">
                  <tr>
                    <th className="text-left px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Producto</th>
                    <th className="text-center px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Cant</th>
                    <th className="text-right px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Precio</th>
                    <th className="text-right px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-on-surface-variant">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container/60">
                  {detalle.items.map((i) => (
                    <tr key={i.id_detalle_venta}>
                      <td className="px-4 py-3 text-on-surface">
                        {i.nombre_producto}
                        {i.numero_serie && (
                          <span className="block text-[11px] text-on-surface-variant font-mono">Serie: {i.numero_serie}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-on-surface">{i.cantidad}</td>
                      <td className="px-4 py-3 text-right text-on-surface">{formatearMoneda(i.precio_unitario)}</td>
                      <td className="px-4 py-3 text-right text-on-surface">{formatearMoneda(i.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-1 text-sm self-end w-full max-w-xs">
              <div className="flex justify-between text-on-surface-variant">
                <span>Subtotal</span><span>{formatearMoneda(detalle.subtotal)}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Descuento</span><span>-{formatearMoneda(detalle.descuento_aplicado)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-on-surface border-t border-surface-container pt-1">
                <span>Total</span><span className="text-primary">{formatearMoneda(detalle.total_venta)}</span>
              </div>
              {detalle.pago && (
                <div className="flex justify-between text-on-surface-variant pt-1">
                  <span>Método</span><span>{detalle.pago.nombre_metodo_pago}</span>
                </div>
              )}
            </div>

            {detalle.estado_venta !== 'cancelada' && (
              <div className="flex justify-end pt-1">
                <Boton
                  type="button"
                  variant="peligro"
                  onClick={() => confirmarCancelacion(detalle)}
                  isLoading={cancelarMutation.isPending}
                >
                  Cancelar venta
                </Boton>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
