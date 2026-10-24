import { useMemo, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, type ApiResponse, ApiHttpError } from '@/lib/api'
import { Tarjeta } from '@/components/ui/Tarjeta'
import { CargadorIris } from '@/components/ui/CargadorIris'
import { PanelPOS } from '../components/PanelPOS'
import { Carrito } from '../components/Carrito'
import { ModalPago } from '../components/ModalPago'
import { Comprobante } from '../components/Comprobante'
import { SelectorSerial } from '../components/SelectorSerial'
import { HistorialVentas } from '../components/HistorialVentas'
import type {
  ClienteVenta,
  CrearVentaPayload,
  ItemCarrito,
  ProductoVendible,
  ReciboData,
  UnidadSerializada,
} from '../types'

type Tab = 'pos' | 'historial'

interface CobroVars {
  payload:        CrearVentaPayload
  recibido:       number | null
  metodoNombre:   string
  clienteNombre:  string
  itemsSnapshot:  ItemCarrito[]
}

function generarUid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export default function PaginaVentas() {
  const queryClient = useQueryClient()

  const [tab, setTab] = useState<Tab>('pos')

  // ─── Estado del carrito ──────────────────────────────────────────────────────
  const [items, setItems] = useState<ItemCarrito[]>([])
  const [cliente, setCliente] = useState<ClienteVenta | null>(null)
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0)
  const [nota, setNota] = useState('')
  const [clienteError, setClienteError] = useState('')

  // ─── Estado de modales ───────────────────────────────────────────────────────
  const [modalPagoAbierto, setModalPagoAbierto] = useState(false)
  const [serialProducto, setSerialProducto] = useState<ProductoVendible | null>(null)
  const [recibo, setRecibo] = useState<ReciboData | null>(null)

  // ─── Catálogo ────────────────────────────────────────────────────────────────
  const { data: productosResponse, isLoading: cargandoProductos } = useQuery({
    queryKey: ['ventas-productos'],
    queryFn: () => api.get<ApiResponse<ProductoVendible[]>>('/ventas/productos-disponibles'),
  })
  const productos = productosResponse?.data ?? []

  // ─── Totales ─────────────────────────────────────────────────────────────────
  const subtotal = useMemo(
    () => items.reduce((acc, i) => acc + i.precio_unitario * i.cantidad, 0),
    [items],
  )
  const descuentoMonto = useMemo(
    () => Math.round(subtotal * (descuentoPorcentaje / 100) * 100) / 100,
    [subtotal, descuentoPorcentaje],
  )
  const total = Math.max(subtotal - descuentoMonto, 0)

  const cantidadesEnCarrito = useMemo(() => {
    const mapa: Record<number, number> = {}
    for (const i of items) {
      if (i.tipo_manejo === 'granel') {
        mapa[i.id_producto] = (mapa[i.id_producto] ?? 0) + i.cantidad
      }
    }
    return mapa
  }, [items])

  // ─── Mutación: crear venta ───────────────────────────────────────────────────
  const cobrarMutation = useMutation({
    mutationFn: ({ payload }: CobroVars) =>
      api.post<ApiResponse<{ id_venta: number; subtotal: number; descuento_aplicado: number; total: number }>>('/ventas', payload),
    onSuccess: (res, vars) => {
      const data = res.data
      setRecibo({
        id_venta:  data.id_venta,
        fecha:     new Date().toISOString(),
        cliente:   vars.clienteNombre,
        metodo:    vars.metodoNombre,
        items:     vars.itemsSnapshot.map((i) => ({
          nombre_producto: i.nombre_producto,
          cantidad:        i.cantidad,
          precio_unitario: i.precio_unitario,
          subtotal:        i.precio_unitario * i.cantidad,
          numero_serie:    i.numero_serie,
        })),
        subtotal:  data.subtotal,
        descuento: data.descuento_aplicado,
        total:     data.total,
        recibido:  vars.recibido ?? undefined,
        cambio:    vars.recibido != null ? Math.round((vars.recibido - data.total) * 100) / 100 : undefined,
      })

      setItems([])
      setCliente(null)
      setDescuentoPorcentaje(0)
      setNota('')
      setModalPagoAbierto(false)

      queryClient.invalidateQueries({ queryKey: ['ventas-productos'] })
      queryClient.invalidateQueries({ queryKey: ['ventas'] })
      queryClient.invalidateQueries({ queryKey: ['ventas-resumen'] })
    },
    onError: (err) => {
      const mensaje = err instanceof ApiHttpError ? err.body.error : 'No se pudo registrar la venta'
      toast.error(mensaje)
    },
  })

  // ─── Handlers del carrito ────────────────────────────────────────────────────
  function agregarProducto(producto: ProductoVendible) {
    if (producto.tipo_manejo === 'serializado') {
      setSerialProducto(producto)
      return
    }

    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id_producto === producto.id_producto && i.tipo_manejo === 'granel')
      if (idx >= 0) {
        const linea = prev[idx]
        if (linea.cantidad >= linea.stock) return prev
        const copia = [...prev]
        copia[idx] = { ...linea, cantidad: linea.cantidad + 1 }
        return copia
      }
      return [
        ...prev,
        {
          uid:                   generarUid(),
          id_producto:           producto.id_producto,
          nombre_producto:       producto.nombre_producto,
          tipo_manejo:           'granel',
          precio_unitario:       producto.precio_venta,
          cantidad:              1,
          stock:                 producto.cantidad,
          id_unidad_serializada: null,
          numero_serie:          null,
        },
      ]
    })
  }

  function agregarSerial(unidad: UnidadSerializada) {
    if (!serialProducto) return
    setItems((prev) => [
      ...prev,
      {
        uid:                   generarUid(),
        id_producto:           serialProducto.id_producto,
        nombre_producto:       serialProducto.nombre_producto,
        tipo_manejo:           'serializado',
        precio_unitario:       serialProducto.precio_venta,
        cantidad:              1,
        stock:                 1,
        id_unidad_serializada: unidad.id_unidad,
        numero_serie:          unidad.numero_serie,
      },
    ])
    setSerialProducto(null)
  }

  function cambiarCantidad(uid: string, cantidad: number) {
    setItems((prev) => {
      if (cantidad < 1) return prev.filter((i) => i.uid !== uid)
      return prev.map((i) => (
        i.uid === uid ? { ...i, cantidad: Math.min(cantidad, i.stock) } : i
      ))
    })
  }

  function quitarItem(uid: string) {
    setItems((prev) => prev.filter((i) => i.uid !== uid))
  }

  function vaciarCarrito() {
    setItems([])
    setDescuentoPorcentaje(0)
    setNota('')
  }

  function iniciarCobro() {
    if (!cliente) {
      setClienteError('Selecciona un cliente para continuar')
      return
    }
    setClienteError('')
    setModalPagoAbierto(true)
  }

  function confirmarPago({ idMetodoPago, referencia, recibido, metodoNombre }: {
    idMetodoPago: number
    referencia:   string | null
    recibido:     number | null
    metodoNombre: string
  }) {
    if (!cliente) return
    const payload: CrearVentaPayload = {
      id_cliente:           cliente.id_cliente,
      descuento_porcentaje: descuentoPorcentaje,
      nota:                 nota.trim() ? nota.trim() : null,
      id_metodo_pago:       idMetodoPago,
      referencia_pago:      referencia,
      items: items.map((i) => ({
        id_producto:           i.id_producto,
        cantidad:              i.cantidad,
        id_unidad_serializada: i.id_unidad_serializada,
      })),
    }

    cobrarMutation.mutate({
      payload,
      recibido,
      metodoNombre,
      clienteNombre: cliente.nombre,
      itemsSnapshot: items,
    })
  }

  const unidadesExcluidas = serialProducto
    ? items.filter((i) => i.id_producto === serialProducto.id_producto && i.id_unidad_serializada != null)
        .map((i) => i.id_unidad_serializada as number)
    : []

  return (
    <div className="p-8 flex flex-col gap-6 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-headline font-extrabold text-2xl text-on-surface">Ventas</h1>
          <p className="text-outline text-sm mt-1">Punto de venta e historial de transacciones.</p>
        </div>

        <div className="inline-flex rounded-2xl bg-surface-container p-1">
          <button
            type="button"
            onClick={() => setTab('pos')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all
              ${tab === 'pos' ? 'bg-white text-primary shadow-ambient' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Punto de venta
          </button>
          <button
            type="button"
            onClick={() => setTab('historial')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all
              ${tab === 'historial' ? 'bg-white text-primary shadow-ambient' : 'text-on-surface-variant hover:text-on-surface'}`}
          >
            Historial
          </button>
        </div>
      </div>

      {tab === 'pos' ? (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
          <Tarjeta titulo="Productos">
            <PanelPOS
              productos={productos}
              isLoading={cargandoProductos}
              onAgregar={agregarProducto}
              cantidadesEnCarrito={cantidadesEnCarrito}
            />
          </Tarjeta>

          <Tarjeta className="lg:sticky lg:top-6">
            <Carrito
              items={items}
              cliente={cliente}
              onClienteChange={(c) => { setCliente(c); if (c) setClienteError('') }}
              clienteError={clienteError}
              descuentoPorcentaje={descuentoPorcentaje}
              onDescuentoChange={setDescuentoPorcentaje}
              nota={nota}
              onNotaChange={setNota}
              subtotal={subtotal}
              descuentoMonto={descuentoMonto}
              total={total}
              onCambiarCantidad={cambiarCantidad}
              onQuitar={quitarItem}
              onVaciar={vaciarCarrito}
              onCobrar={iniciarCobro}
              cobrando={cobrarMutation.isPending}
            />
          </Tarjeta>
        </div>
      ) : (
        <HistorialVentas />
      )}

      <SelectorSerial
        producto={serialProducto}
        isOpen={serialProducto != null}
        onClose={() => setSerialProducto(null)}
        onSelect={agregarSerial}
        excluidas={unidadesExcluidas}
      />

      <ModalPago
        isOpen={modalPagoAbierto}
        onClose={() => setModalPagoAbierto(false)}
        total={total}
        procesando={cobrarMutation.isPending}
        onConfirm={({ idMetodoPago, referencia, recibido, metodoNombre }) =>
          confirmarPago({ idMetodoPago, referencia, recibido, metodoNombre })}
      />

      <Comprobante recibo={recibo} onClose={() => setRecibo(null)} />

      {cobrarMutation.isPending && !modalPagoAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <CargadorIris />
        </div>
      )}
    </div>
  )
}
