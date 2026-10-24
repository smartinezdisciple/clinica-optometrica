import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, type ApiResponse } from '@/lib/api'
import { Modal } from '@/components/ui/Modal'
import { Campo } from '@/components/ui/Campo'
import { Boton } from '@/components/ui/Boton'
import { Insignia } from '@/components/ui/Insignia'
import type { ItemCompra, Proveedor } from '../types'
import type { ProductoInventario } from '@/features/inventario/types'

interface Props {
  isOpen:    boolean
  onClose:   () => void
  proveedores: Proveedor[]
  productos: ProductoInventario[]
  onProveedorCreado?: (p: Proveedor) => void
}

const inputCls =
  'w-full bg-surface-container-low border border-transparent rounded-xl py-2.5 px-4 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary/30'

interface ItemRow {
  uid:            string
  origen:         'existente' | 'nuevo'
  idProducto:     number | ''
  nuevoNombre:    string
  nuevoTipo:      string
  nuevoManejo:    'granel' | 'serializado'
  nuevoPrecioVenta: string
  precioUnitario: string
  cantidad:       string
  seriales:       string
}

const TIPOS_MANEJO: { value: 'granel' | 'serializado'; label: string }[] = [
  { value: 'granel', label: 'Granel' },
  { value: 'serializado', label: 'Serializado' },
]

let contador = 0
const uidNuevo = () => `item-${Date.now()}-${(contador += 1)}`

/**
 * Modal de creación de órdenes de compra (con o sin recepción de mercadería).
 */
export function ModalNuevaCompra({ isOpen, onClose, proveedores, productos, onProveedorCreado }: Props) {
  const queryClient = useQueryClient()
  const [enviando, setEnviando] = useState(false)
  const [idProveedor, setIdProveedor] = useState<number | ''>('')
  const [recibida, setRecibida] = useState(false)
  const [observaciones, setObservaciones] = useState('')
  const [items, setItems] = useState<ItemRow[]>([])

  // ─── Sub-modal "nuevo proveedor" ─────────────────────────────────────────────
  const [modalProveedor, setModalProveedor] = useState(false)
  const [provNombre, setProvNombre] = useState('')
  const [provContacto, setProvContacto] = useState('')
  const [provTelefono, setProvTelefono] = useState('')
  const [provCorreo, setProvCorreo] = useState('')
  const [provDireccion, setProvDireccion] = useState('')
  const [provRuc, setProvRuc] = useState('')

  const reset = () => {
    setIdProveedor('')
    setRecibida(false)
    setObservaciones('')
    setItems([])
  }

  const cerrar = () => {
    reset()
    onClose()
  }

  const setItem = (uid: string, patch: Partial<ItemRow>) => {
    setItems((prev) => prev.map((it) => (it.uid === uid ? { ...it, ...patch } : it)))
  }

  const agregarItem = () => {
    setItems((prev) => [
      ...prev,
      { uid: uidNuevo(), origen: 'existente', idProducto: '', nuevoNombre: '', nuevoTipo: 'accesorio', nuevoManejo: 'granel', nuevoPrecioVenta: '', precioUnitario: '', cantidad: '1', seriales: '' },
    ])
  }

  const quitarItem = (uid: string) => {
    setItems((prev) => prev.filter((it) => it.uid !== uid))
  }

  const crearProveedor = async () => {
    if (!provNombre.trim()) return toast.error('El nombre de la empresa es requerido')
    try {
      const res = await api.post<ApiResponse<Proveedor>>('/compras/proveedores', {
        nombre_empresa:  provNombre.trim(),
        nombre_contacto: provContacto.trim() || null,
        telefono:        provTelefono.trim() || null,
        correo:          provCorreo.trim() || null,
        direccion:       provDireccion.trim() || null,
        ruc:             provRuc.trim() || null,
      })
      toast.success('Proveedor creado')
      queryClient.invalidateQueries({ queryKey: ['compras-proveedores'] })
      if (onProveedorCreado) onProveedorCreado(res.data)
      setModalProveedor(false)
      setProvNombre('')
      setProvContacto('')
      setProvTelefono('')
      setProvCorreo('')
      setProvDireccion('')
      setProvRuc('')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo crear el proveedor')
    }
  }

  const buildItems = (): ItemCompra[] | null => {
    const resultado: ItemCompra[] = []
    for (const it of items) {
      const precioUnitario = Number(it.precioUnitario)
      if (it.precioUnitario === '' || isNaN(precioUnitario)) {
        toast.error('Revisa el precio unitario de cada ítem')
        return null
      }

      const base: ItemCompra = { precio_unitario: precioUnitario }

      if (it.origen === 'nuevo') {
        const precioVenta = Number(it.nuevoPrecioVenta)
        if (!it.nuevoNombre.trim() || isNaN(precioVenta)) {
          toast.error('Completa nombre y precio de venta del producto nuevo')
          return null
        }
        base.nuevoProducto = {
          nombre_producto: it.nuevoNombre.trim(),
          codigo_producto: null,
          tipo_producto:   it.nuevoTipo,
          tipo_manejo:     it.nuevoManejo,
          precio_venta:    precioVenta,
          precio_compra:   precioUnitario,
          marca:           null,
        }
        base.cantidad = it.nuevoManejo === 'granel' ? parseInt(it.cantidad, 10) || 1 : undefined
        if (it.nuevoManejo === 'serializado') {
          base.seriales = it.seriales.split('\n').map((s) => s.trim()).filter(Boolean)
          if (!base.seriales.length) {
            toast.error('Agrega al menos un serial al producto nuevo')
            return null
          }
        }
        resultado.push(base)
        continue
      }

      if (it.idProducto === '') {
        toast.error('Selecciona el producto de cada ítem')
        return null
      }
      const producto = productos.find((p) => p.id_producto === it.idProducto)
      base.id_producto = it.idProducto as number
      if (producto?.tipo_manejo === 'serializado') {
        base.seriales = it.seriales.split('\n').map((s) => s.trim()).filter(Boolean)
        if (!base.seriales?.length) {
          toast.error(`Agrega al menos un serial para ${producto.nombre_producto}`)
          return null
        }
      } else {
        base.cantidad = parseInt(it.cantidad, 10) || 1
      }
      resultado.push(base)
    }
    return resultado
  }

  const crearCompra = async () => {
    if (!idProveedor) return toast.error('Selecciona un proveedor')
    const itemsListos = buildItems()
    if (!itemsListos) return

    try {
      setEnviando(true)
      await api.post('/compras', {
        id_proveedor:  idProveedor,
        observaciones: observaciones.trim() || null,
        recibida,
        items:         itemsListos,
      })
      toast.success(recibida ? 'Compra recibida: inventario actualizado' : 'Orden de compra creada')
      queryClient.invalidateQueries({ queryKey: ['compras-lista'] })
      queryClient.invalidateQueries({ queryKey: ['inventario-productos'] })
      cerrar()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo crear la compra')
    } finally {
      setEnviando(false)
    }
  }

  const total = useMemo(
    () =>
      items.reduce((acc, it) => {
        const pu = Number(it.precioUnitario) || 0
        const n =
          it.origen === 'nuevo'
            ? it.nuevoManejo === 'granel'
              ? parseInt(it.cantidad, 10) || 0
              : it.seriales.split('\n').filter((s) => s.trim()).length
            : (productos.find((p) => p.id_producto === it.idProducto)?.tipo_manejo ?? 'granel') === 'serializado'
              ? it.seriales.split('\n').filter((s) => s.trim()).length
              : parseInt(it.cantidad, 10) || 0
        return acc + pu * n
      }, 0),
    [items, productos],
  )

  return (
    <Modal isOpen={isOpen} onClose={cerrar} titulo="Nueva compra" maxWith="xl">
      <div className="space-y-5">
        {/* Proveedor */}
        <div className="flex items-end gap-3">
          <div className="flex flex-col gap-1.5 flex-1">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Proveedor</label>
            <select
              className={inputCls}
              value={idProveedor}
              onChange={(e) => setIdProveedor(Number(e.target.value))}
            >
              <option value="">Selecciona un proveedor…</option>
              {proveedores.map((p) => (
                <option key={p.id_proveedor} value={p.id_proveedor}>{p.nombre_empresa}</option>
              ))}
            </select>
          </div>
          <Boton variant="secundario" type="button" onClick={() => setModalProveedor(true)}>
            <span className="material-symbols-outlined text-[18px]">business</span>
            Nuevo proveedor
          </Boton>
        </div>

        {/* ItemI ítems */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-on-surface font-headline">Ítems</h3>
          <Boton variant="secundario" type="button" onClick={agregarItem}>
            <span className="material-symbols-outlined text-[18px]">add</span>
            Agregar ítem
          </Boton>
        </div>

        <div className="space-y-3">
          {items.length === 0 && (
            <p className="text-sm text-outline text-center py-6">Agrega al menos un ítem a la compra.</p>
          )}
          {items.map((it) => {
            const producto = productos.find((p) => p.id_producto === it.idProducto)
            const manejo = it.origen === 'nuevo' ? it.nuevoManejo : (producto?.tipo_manejo ?? 'granel')
            return (
              <div key={it.uid} className="border border-surface-container rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setItem(it.uid, { origen: 'existente' })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${it.origen === 'existente' ? 'bg-primary-gradient text-white' : 'bg-surface-container text-on-surface-variant'}`}
                    >
                      Existente
                    </button>
                    <button
                      type="button"
                      onClick={() => setItem(it.uid, { origen: 'nuevo' })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${it.origen === 'nuevo' ? 'bg-primary-gradient text-white' : 'bg-surface-container text-on-surface-variant'}`}
                    >
                      Producto nuevo
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => quitarItem(it.uid)}
                    className="text-outline hover:text-red-500 transition-all"
                    aria-label="Quitar ítem"
                  >
                    <span className="material-symbols-outlined text-[20px]">delete</span>
                  </button>
                </div>

                {it.origen === 'existente' ? (
                  <select
                    className={inputCls}
                    value={it.idProducto}
                    onChange={(e) => setItem(it.uid, { idProducto: Number(e.target.value) })}
                  >
                    <option value="">Selecciona producto…</option>
                    {productos.map((p) => (
                      <option key={p.id_producto} value={p.id_producto}>
                        {p.nombre_producto} ({p.tipo_manejo_label})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Campo
                      label="Nombre del producto"
                      value={it.nuevoNombre}
                      onChange={(e) => setItem(it.uid, { nuevoNombre: e.target.value })}
                    />
                    <Campo
                      label="Precio de venta estimado (S/)"
                      type="number"
                      min="0"
                      step="0.01"
                      value={it.nuevoPrecioVenta}
                      onChange={(e) => setItem(it.uid, { nuevoPrecioVenta: e.target.value })}
                    />
                    <div className="flex flex-col gap-1.5">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Categoría</label>
                      <select
                        className={inputCls}
                        value={it.nuevoTipo}
                        onChange={(e) => setItem(it.uid, { nuevoTipo: e.target.value })}
                      >
                        <option value="accesorio">Accesorio</option>
                        <option value="gafas_sol">Gafas de sol</option>
                        <option value="marco_oftalmologico">Marco oftalmológico</option>
                        <option value="lente_comercial">Lente comercial</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Manejo</label>
                      <select
                        className={inputCls}
                        value={it.nuevoManejo}
                        onChange={(e) => setItem(it.uid, { nuevoManejo: e.target.value as 'granel' | 'serializado' })}
                      >
                        {TIPOS_MANEJO.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <Campo
                    label="Precio unitario (S/)"
                    type="number"
                    min="0"
                    step="0.01"
                    value={it.precioUnitario}
                    onChange={(e) => setItem(it.uid, { precioUnitario: e.target.value })}
                  />
                  {manejo === 'granel' ? (
                    <Campo
                      label="Cantidad"
                      type="number"
                      min="1"
                      value={it.cantidad}
                      onChange={(e) => setItem(it.uid, { cantidad: e.target.value })}
                    />
                  ) : (
                    <span className="flex flex-col gap-1.5">
                      <span className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Seriales (uno por línea)</span>
                      <textarea
                        className={`${inputCls} min-h-[64px] font-mono`}
                        placeholder={'SR-2026-0001\nSR-2026-0002'}
                        value={it.seriales}
                        onChange={(e) => setItem(it.uid, { seriales: e.target.value })}
                      />
                    </span>
                  )}
                  <Insignia variant={manejo === 'serializado' ? 'primario' : 'exito'}>
                    {manejo === 'serializado' ? 'Serializado' : 'Granel'}
                  </Insignia>
                </div>
              </div>
            )
          })}

          {items.length > 0 && (
            <div className="flex justify-end">
              <p className="text-sm font-bold text-on-surface">
                Total:{' '}
                <span className="font-mono text-primary">S/ {total.toFixed(2)}</span>
              </p>
            </div>
          )}
        </div>

        {/* Opciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 text-sm text-on-surface-variant cursor-pointer select-none">
            <input
              type="checkbox"
              checked={recibida}
              onChange={(e) => setRecibida(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
            Marcar como recibida (suma al inventario)
          </label>
          <Campo
            label="Observaciones"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Opcional"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Boton variant="fantasma" type="button" onClick={cerrar}>Cancelar</Boton>
        <Boton type="button" isLoading={enviando} onClick={crearCompra}>
          <span className="material-symbols-outlined text-[18px]">shopping_cart</span>
          Guardar compra
        </Boton>
      </div>

      {/* Modal nuevo proveedor */}
      <Modal isOpen={modalProveedor} onClose={() => setModalProveedor(false)} titulo="Nuevo proveedor">
        <div className="space-y-4">
          <Campo label="Nombre de la empresa" value={provNombre} onChange={(e) => setProvNombre(e.target.value)} />
          <Campo label="Contacto" value={provContacto} onChange={(e) => setProvContacto(e.target.value)} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Campo label="Teléfono" value={provTelefono} onChange={(e) => setProvTelefono(e.target.value)} />
            <Campo label="Correo" value={provCorreo} onChange={(e) => setProvCorreo(e.target.value)} />
          </div>
          <Campo label="RUC" value={provRuc} onChange={(e) => setProvRuc(e.target.value)} />
          <Campo label="Dirección" value={provDireccion} onChange={(e) => setProvDireccion(e.target.value)} />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Boton variant="fantasma" type="button" onClick={() => setModalProveedor(false)}>Cancelar</Boton>
          <Boton type="button" onClick={crearProveedor}>Guardar proveedor</Boton>
        </div>
      </Modal>
    </Modal>
  )
}