import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, type ApiResponse } from '@/lib/api'
import { Tarjeta } from '@/components/ui/Tarjeta'
import { Tabla } from '@/components/ui/Tabla'
import { Boton } from '@/components/ui/Boton'
import { Insignia } from '@/components/ui/Insignia'
import { CargadorIris } from '@/components/ui/CargadorIris'
import { Modal } from '@/components/ui/Modal'
import type { Compra, CompraDetalle, Proveedor } from '../types'
import type { ProductoInventario } from '@/features/inventario/types'
import { ModalNuevaCompra } from '../components/ModalNuevaCompra'

const ESTADO_VARIANT: Record<string, 'primario' | 'exito' | 'advertencia' | 'error' | 'neutro'> = {
  en_proceso: 'primario',
  finalizada: 'exito',
  cancelada: 'error',
}

const ESTADO_LABEL: Record<string, string> = {
  en_proceso: 'En proceso',
  finalizada: 'Finalizada',
  cancelada: 'Cancelada',
}

export default function PaginaCompras() {
  const queryClient = useQueryClient()
  const [modalNueva, setModalNueva] = useState(false)
  const [detalleAbierto, setDetalleAbierto] = useState(false)
  const [compraId, setCompraId] = useState<number | null>(null)

  const { data: comprasResp, isLoading: cargandoCompras } = useQuery({
    queryKey: ['compras-lista'],
    queryFn: () => api.get<ApiResponse<Compra[]>>('/compras'),
    refetchInterval: 15000,
  })
  const { data: proveedoresResp } = useQuery({
    queryKey: ['compras-proveedores'],
    queryFn: () => api.get<ApiResponse<Proveedor[]>>('/compras/proveedores'),
  })
  const { data: productosResp } = useQuery({
    queryKey: ['inventario-productos'],
    queryFn: () => api.get<ApiResponse<ProductoInventario[]>>('/inventario/productos'),
  })

  const { data: detalleResp, isFetching: cargandoDetalle } = useQuery({
    queryKey: ['compras-detalle', compraId],
    queryFn: () => api.get<ApiResponse<CompraDetalle>>(`/compras/${compraId}`),
    enabled: compraId !== null && detalleAbierto,
  })

  const compras = comprasResp?.data ?? []
  const proveedores = proveedoresResp?.data ?? []
  const productos = productosResp?.data ?? []
  const detalle = detalleResp?.data

  const columns = [
    { key: 'id_compra', label: '#', className: 'w-12' },
    {
      key: 'fecha_compra',
      label: 'Fecha',
      render: (row: Compra) => (
        <span>
          {new Date(row.fecha_compra).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    { key: 'nombre_empresa', label: 'Proveedor' },
    { key: 'numero_items', label: 'Ítems' },
    {
      key: 'estado_compra',
      label: 'Estado',
      render: (row: Compra) => (
        <Insignia variant={ESTADO_VARIANT[row.estado_compra] ?? 'neutro'}>
          {ESTADO_LABEL[row.estado_compra] ?? row.estado_compra}
        </Insignia>
      ),
    },
    {
      key: 'total_compra',
      label: 'Total',
      className: 'text-right',
      render: (row: Compra) => (
        <span className="font-mono font-semibold">S/ {Number(row.total_compra).toFixed(2)}</span>
      ),
    },
    {
      key: 'acciones',
      label: '',
      className: 'w-40',
      render: (row: Compra) => (
        <div className="flex gap-2">
          <Boton
            variant="fantasma"
            type="button"
            className="px-3 py-1.5"
            onClick={() => {
              setCompraId(row.id_compra)
              setDetalleAbierto(true)
            }}
          >
            Ver
          </Boton>
          {row.estado_compra === 'en_proceso' && (
            <Boton
              variant="secundario"
              type="button"
              className="px-3 py-1.5"
              onClick={async () => {
                try {
                  await api.patch(`/compras/${row.id_compra}/estado`, { estado: 'finalizada' })
                  toast.success('Compra recibida: inventario actualizado')
                  queryClient.invalidateQueries({ queryKey: ['compras-lista'] })
                  queryClient.invalidateQueries({ queryKey: ['inventario-productos'] })
                } catch (e) {
                  toast.error(e instanceof Error ? e.message : 'No se pudo actualizar el estado')
                }
              }}
            >
              Recibir
            </Boton>
          )}
        </div>
      ),
    },
  ]

  const columnasProveedores = [
    { key: 'nombre_empresa', label: 'Empresa' },
    {
      key: 'nombre_contacto',
      label: 'Contacto',
      render: (row: Proveedor) => <span>{row.nombre_contacto ?? '—'}</span>,
    },
    { key: 'telefono', label: 'Teléfono', render: (row: Proveedor) => <span>{row.telefono ?? '—'}</span> },
    { key: 'ruc', label: 'RUC', render: (row: Proveedor) => <span>{row.ruc ?? '—'}</span> },
  ]

  return (
    <div className="p-8 animate-fade-up space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-headline text-on-surface">Compras</h1>
          <p className="text-sm text-outline mt-1">
            Ordenes de compra, proveedores y recepción de mercadería
          </p>
        </div>
        <Boton onClick={() => setModalNueva(true)}>
          <span className="material-symbols-outlined text-[18px]">add_shopping_cart</span>
          Nueva compra
        </Boton>
      </div>

      <Tarjeta titulo="Ordenes de compra">
        {cargandoCompras ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <CargadorIris size={48} />
            <p className="text-sm text-outline mt-4 font-semibold">Cargando compras…</p>
          </div>
        ) : (
          <Tabla columns={columns} data={compras} emptyMessage="No hay compras registradas." />
        )}
      </Tarjeta>

      <Tarjeta titulo="Proveedores">
        {proveedores.length === 0 ? (
          <p className="text-sm text-outline py-8 text-center">
            Aun no hay proveedores registrados. Crea tu primera compra para agregar uno.
          </p>
        ) : (
          <Tabla columns={columnasProveedores} data={proveedores} emptyMessage="Sin proveedores." />
        )}
      </Tarjeta>

      <ModalNuevaCompra
        isOpen={modalNueva}
        onClose={() => setModalNueva(false)}
        proveedores={proveedores}
        productos={productos}
      />

      {/* Detalle de compra */}
      <Modal
        isOpen={detalleAbierto}
        onClose={() => {
          setDetalleAbierto(false)
          setCompraId(null)
        }}
        titulo="Detalle de compra"
        maxWith="xl"
      >
        {cargandoDetalle || !detalle ? (
          <div className="py-14 flex items-center justify-center">
            <CargadorIris size={44} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs font-bold text-outline uppercase">Proveedor</p>
                <p className="font-bold text-on-surface">{detalle.nombre_empresa}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-outline uppercase">Fecha</p>
                <p className="font-bold text-on-surface">
                  {new Date(detalle.fecha_compra).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-outline uppercase">Estado</p>
                <Insignia variant={ESTADO_VARIANT[detalle.estado_compra] ?? 'neutro'}>
                  {ESTADO_LABEL[detalle.estado_compra] ?? detalle.estado_compra}
                </Insignia>
              </div>
              <div>
                <p className="text-xs font-bold text-outline uppercase">Total</p>
                <p className="font-bold font-mono text-primary">S/ {Number(detalle.total_compra).toFixed(2)}</p>
              </div>
            </div>

            <div className="border border-surface-container rounded-xl overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-surface-container-low text-xs font-bold text-outline uppercase tracking-wider">
                <span className="col-span-5">Producto</span>
                <span className="col-span-2">Cantidad</span>
                <span className="col-span-2">Precio</span>
                <span className="col-span-3 text-right">Subtotal</span>
              </div>
              {detalle.items.map((it) => (
                <div key={it.id_detalle_compra} className="grid grid-cols-12 gap-2 px-4 py-3 border-t border-surface-container text-sm">
                  <span className="col-span-5 font-semibold text-on-surface">{it.nombre_producto}</span>
                  <span className="col-span-2 text-on-surface-variant">
                    {it.tipo_manejo === 'serializado' ? `${it.unidadesCreadas} u.` : it.cantidad}
                  </span>
                  <span className="col-span-2 font-mono">S/ {Number(it.precio_unitario).toFixed(2)}</span>
                  <span className="col-span-3 text-right font-mono font-semibold">S/ {Number(it.subtotal).toFixed(2)}</span>
                  {it.tipo_manejo === 'serializado' && it.seriales && (
                    <div className="col-span-12 flex flex-wrap gap-1 pt-1">
                      {it.seriales.map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {detalle.observaciones && (
              <p className="text-sm text-outline">
                <strong className="text-on-surface-variant">Observaciones: </strong>
                {detalle.observaciones}
              </p>
            )}

            {detalle.estado_compra === 'en_proceso' && (
              <div className="flex justify-end">
                <Boton
                  type="button"
                  onClick={async () => {
                    try {
                      await api.patch(`/compras/${detalle.id_compra}/estado`, { estado: 'finalizada' })
                      toast.success('Compra recibida: inventario actualizado')
                      setCompraId(detalle.id_compra)
                      queryClient.invalidateQueries({ queryKey: ['compras-lista'] })
                      queryClient.invalidateQueries({ queryKey: ['inventario-productos'] })
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : 'No se pudo recibir la compra')
                    }
                  }}
                >
                  Marcar como recibida
                </Boton>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}