import { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/api'
import { Modal } from '@/components/ui/Modal'
import { Campo } from '@/components/ui/Campo'
import { Boton } from '@/components/ui/Boton'
import type { ProductoInventario, TipoManejo, TipoProducto } from '../types'

interface Props {
  isOpen:    boolean
  onClose:   () => void
  productos: ProductoInventario[]
}

const TIPOS_PRODUCTO: { value: TipoProducto; label: string }[] = [
  { value: 'marco_oftalmologico', label: 'Marco oftalmológico' },
  { value: 'gafas_sol',          label: 'Gafas de sol' },
  { value: 'accesorio',          label: 'Accesorio' },
  { value: 'lente_comercial',    label: 'Lente comercial' },
]

const TIPOS_MANEJO: { value: TipoManejo; label: string }[] = [
  { value: 'granel',       label: 'Granel (por cantidad)' },
  { value: 'serializado',  label: 'Serializado (unidad única)' },
]

const inputCls =
  'w-full bg-surface-container-low border border-transparent rounded-xl py-3 px-4 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary/30'

/**
 * Modal de ingreso de productos al inventario.
 * Dos modos: crear un productonuevo (granel o serializado) o agregar stock/seriales
 * a un producto existente.
 */
export function ModalIngresoInventario({ isOpen, onClose, productos }: Props) {
  const queryClient = useQueryClient()
  const [tab, setTab] = useState<'nuevo' | 'ingreso'>('nuevo')
  const [enviando, setEnviando] = useState(false)

  // ─── Formulario "Nuevo producto" ──────────────────────────────────────────────
  const [nombre, setNombre] = useState('')
  const [codigo, setCodigo] = useState('')
  const [tipoProducto, setTipoProducto] = useState<TipoProducto>('marco_oftalmologico')
  const [tipoManejo, setTipoManejo] = useState<TipoManejo>('granel')
  const [precioVenta, setPrecioVenta] = useState('')
  const [stockInicial, setStockInicial] = useState('0')
  const [seriales, setSeriales] = useState('')

  // ─── Formulario "Ingreso a existente" ─────────────────────────────────────────
  const [idProducto, setIdProducto] = useState<number | ''>('')
  const [cantidad, setCantidad] = useState('1')

  // ─── Autogenerador de seriales ───────────────────────────────────────────────
  const [prefijo, setPrefijo] = useState('')
  const [cantidadGenerar, setCantidadGenerar] = useState('5')

  const productoSeleccionado = useMemo(
    () => productos.find((p) => p.id_producto === idProducto),
    [productos, idProducto],
  )

  const serialesList = seriales
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

  const resetFormularios = () => {
    setNombre('')
    setCodigo('')
    setTipoProducto('marco_oftalmologico')
    setTipoManejo('granel')
    setPrecioVenta('')
    setStockInicial('0')
    setSeriales('')
    setIdProducto('')
    setCantidad('1')
    setPrefijo('')
    setCantidadGenerar('5')
    setTab('nuevo')
  }

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ['inventario-productos'] })
  }

  const cerrar = () => {
    resetFormularios()
    onClose()
  }

  const autogenerarSeriales = () => {
    const n = Math.max(1, parseInt(cantidadGenerar, 10) || 1)
    const base = prefijo.trim() || 'SR'
    const nuevas: string[] = []
    for (let i = 0; i < n; i += 1) {
      // Continuar numeración a partir de lo que ya hay en el textarea
      nuevas.push(`${base}-${String(i + 1).padStart(4, '0')}`)
    }
    const juntas = serialize(seriales, nuevas)
    setSeriales(juntas)
  }

  const crearProducto = async () => {
    if (!nombre.trim()) return toast.error('El nombre del producto es requerido')
    const precio = Number(precioVenta)
    if (precioVenta === '' || isNaN(precio)) return toast.error('Ingresa un precio de venta válido')

    const payload: Record<string, unknown> = {
      nombre_producto:  nombre.trim(),
      codigo_producto:  codigo.trim() || null,
      tipo_producto:    tipoProducto,
      tipo_manejo:      tipoManejo,
      precio_venta:     precio,
    }

    if (tipoManejo === 'granel') {
      payload.stock_inicial = parseInt(stockInicial, 10) || 0
    } else {
      if (serialesList.length === 0) return toast.error('Agrega al menos un número de serie')
      payload.seriales = serialesList
    }

    try {
      setEnviando(true)
      await api.post('/inventario/productos', payload)
      toast.success('Producto creado en el inventario')
      invalidar()
      cerrar()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo crear el producto')
    } finally {
      setEnviando(false)
    }
  }

  const ingresarStock = async () => {
    if (!idProducto) return toast.error('Selecciona un producto')
    if (!productoSeleccionado) return

    try {
      setEnviando(true)
      if (productoSeleccionado.tipo_manejo === 'granel') {
        const n = parseInt(cantidad, 10)
        if (!n || n <= 0) return toast.error('Ingresa una cantidad válida')
        await api.post('/inventario/movimientos', {
          id_producto:     idProducto,
          cantidad:        n,
          tipo_movimiento: 'entrada',
          motivo:          'Ingreso manual desde inventario',
        })
        toast.success(`Se agregaron ${n} unidad(es) al producto`)
      } else {
        if (serialesList.length === 0) return toast.error('Agrega al menos un número de serie')
        await api.post(`/inventario/productos/${idProducto}/seriales`, { seriales: serialesList })
        toast.success(`${serialesList.length} serial(es) registrados`)
      }
      invalidar()
      cerrar()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo registrar el ingreso')
    } finally {
      setEnviando(false)
    }
  }

  const submit = tab === 'nuevo' ? crearProducto : ingresarStock

  return (
    <Modal isOpen={isOpen} onClose={cerrar} titulo="Ingreso de inventario" maxWith="xl">
      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {([
          ['nuevo', 'Nuevo producto'],
          ['ingreso', 'Ingreso a existente'],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all
              ${tab === key ? 'bg-primary-gradient text-white shadow-primary-glow' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'nuevo' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Campo
              label="Nombre del producto"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej. Marco Ray-Ban RB2140"
            />
            <Campo
              label="Código"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="Opcional"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Categoría</label>
              <select className={inputCls} value={tipoProducto} onChange={(e) => setTipoProducto(e.target.value as TipoProducto)}>
                {TIPOS_PRODUCTO.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Forma de manejo</label>
              <select className={inputCls} value={tipoManejo} onChange={(e) => setTipoManejo(e.target.value as TipoManejo)}>
                {TIPOS_MANEJO.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Campo
              label="Precio de venta (S/)"
              type="number"
              min="0"
              step="0.01"
              value={precioVenta}
              onChange={(e) => setPrecioVenta(e.target.value)}
              placeholder="0.00"
            />
            {tipoManejo === 'granel' ? (
              <Campo
                label="Stock inicial (cantidad)"
                type="number"
                min="0"
                value={stockInicial}
                onChange={(e) => setStockInicial(e.target.value)}
              />
            ) : (
              <div className="flex flex-col gap-1.5">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Autogenerar seriales</label>
                <div className="flex gap-2">
                  <Campo
                    placeholder="Prefijo · Ej. LP-2026"
                    value={prefijo}
                    onChange={(e) => setPrefijo(e.target.value)}
                    containerClassName="flex-1"
                  />
                  <Campo
                    type="number"
                    min="1"
                    className="w-24"
                    value={cantidadGenerar}
                    onChange={(e) => setCantidadGenerar(e.target.value)}
                  />
                </div>
                <Boton variant="secundario" type="button" onClick={autogenerarSeriales}>
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                  Generar
                </Boton>
              </div>
            )}
          </div>

          {tipoManejo === 'serializado' && (
            <div className="flex flex-col gap-1.5">
              <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Número de serie (uno por línea) — {serialesList.length}
              </label>
              <textarea
                className={`${inputCls} min-h-[120px] font-mono`}
                placeholder={'LP-2026-0001\nLP-2026-0002'}
                value={seriales}
                onChange={(e) => setSeriales(e.target.value)}
              />
            </div>
          )}
        </div>
      )}

      {tab === 'ingreso' && (
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Producto</label>
            <select className={inputCls} value={idProducto} onChange={(e) => setIdProducto(Number(e.target.value))}>
              <option value="">Selecciona un producto…</option>
              {productos.map((p) => (
                <option key={p.id_producto} value={p.id_producto}>
                  {p.nombre_producto} — {p.tipo_manejo_label} · stock {p.cantidad}
                </option>
              ))}
            </select>
          </div>

          {productoSeleccionado && (
            <div className="flex flex-col gap-3">
              {productoSeleccionado.tipo_manejo === 'granel' ? (
                <Campo
                  label="Cantidad a ingresar"
                  type="number"
                  min="1"
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                />
              ) : (
                <>
                  <div className="flex gap-2 items-end">
                    <Campo
                      label="Prefijo"
                      placeholder="Ej. LP-2026"
                      value={prefijo}
                      onChange={(e) => setPrefijo(e.target.value)}
                      containerClassName="flex-1"
                    />
                    <Campo
                      label="Cantidad"
                      type="number"
                      min="1"
                      className="w-24"
                      value={cantidadGenerar}
                      onChange={(e) => setCantidadGenerar(e.target.value)}
                    />
                    <Boton variant="secundario" type="button" onClick={autogenerarSeriales}>
                      Generar
                    </Boton>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                      Número de serie (uno por línea) — {serialesList.length}
                    </label>
                    <textarea
                      className={`${inputCls} min-h-[120px] font-mono`}
                      placeholder={'LP-2026-0003\nLP-2026-0004'}
                      value={seriales}
                      onChange={(e) => setSeriales(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-end gap-3 mt-6">
        <Boton variant="fantasma" type="button" onClick={cerrar}>Cancelar</Boton>
        <Boton type="button" isLoading={enviando} onClick={submit}>
          {tab === 'nuevo' ? 'Crear producto' : 'Registrar ingreso'}
        </Boton>
      </div>
    </Modal>
  )
}

/**
 * Une los seriales ya escritos con los autogenerados sin duplicar.
 */
function serialize(existentes: string, nuevas: string[]): string {
  const actuales = existentes.split('\n').map((s) => s.trim()).filter(Boolean)
  const conjunto = [...actuales]
  let offset = 1
  for (const serie of nuevas) {
    const candidata = serie
    if (!conjunto.includes(candidata)) {
      conjunto.push(candidata)
      offset += 1
    }
  }
  return conjunto.join('\n')
}