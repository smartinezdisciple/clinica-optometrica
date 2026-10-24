import { useMemo, useState } from 'react'
import { BarraBusqueda } from '@/components/ui/BarraBusqueda'
import { CargadorIris } from '@/components/ui/CargadorIris'
import type { ProductoVendible } from '../types'

interface PanelPOSProps {
  productos:               ProductoVendible[]
  isLoading:               boolean
  onAgregar:               (producto: ProductoVendible) => void
  /** Cantidad ya presente en el carrito por producto (solo granel). */
  cantidadesEnCarrito:     Record<number, number>
}

function formatearMoneda(valor: number): string {
  return `₡${valor.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Catálogo de productos del Punto de Venta: buscador, filtro por categoría y
 * grilla de tarjetas clicables para agregar al carrito.
 */
export function PanelPOS({ productos, isLoading, onAgregar, cantidadesEnCarrito }: PanelPOSProps) {
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState('Todos')

  const categorias = useMemo(
    () => ['Todos', ...Array.from(new Set(productos.map((p) => p.tipo_producto)))],
    [productos],
  )

  const filtrados = useMemo(() => {
    const term = busqueda.trim().toLowerCase()
    return productos.filter((p) => {
      const coincideCategoria = categoria === 'Todos' || p.tipo_producto === categoria
      const coincideTexto = !term || p.nombre_producto.toLowerCase().includes(term)
      return coincideCategoria && coincideTexto
    })
  }, [productos, busqueda, categoria])

  return (
    <div className="flex flex-col gap-4">
      <BarraBusqueda
        id="pos-busqueda"
        placeholder="Buscar producto por nombre…"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      <div className="flex flex-wrap gap-2">
        {categorias.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoria(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all
              ${categoria === cat
                ? 'bg-primary text-white shadow-primary-glow'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center"><CargadorIris /></div>
      ) : filtrados.length === 0 ? (
        <div className="py-16 flex flex-col items-center justify-center text-outline">
          <span className="material-symbols-outlined text-3xl">inventory_2</span>
          <p className="text-sm mt-2">No se encontraron productos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {filtrados.map((p) => {
            const esGranel = p.tipo_manejo === 'granel'
            const enCarrito = cantidadesEnCarrito[p.id_producto] ?? 0
            const sinStock = esGranel && (p.cantidad <= 0 || enCarrito >= p.cantidad)
            const stockMostrar = esGranel ? p.cantidad - enCarrito : p.cantidad

            return (
              <button
                key={p.id_producto}
                type="button"
                disabled={sinStock}
                onClick={() => onAgregar(p)}
                className="group text-left bg-white rounded-2xl border border-surface-container p-4 shadow-ambient transition-all
                  hover:-translate-y-0.5 hover:shadow-float hover:border-primary/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">
                    {p.tipo_manejo === 'serializado' ? 'qr_code_2' : 'cube'}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                    {p.tipo_producto}
                  </span>
                </div>

                <p className="mt-2 text-sm font-bold text-on-surface leading-snug line-clamp-2 min-h-[2.5rem]">
                  {p.nombre_producto}
                </p>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-base font-extrabold text-primary">{formatearMoneda(p.precio_venta)}</span>
                  <span className={`text-[11px] font-semibold ${sinStock ? 'text-red-500' : 'text-on-surface-variant'}`}>
                    {esGranel ? `Stock: ${Math.max(stockMostrar, 0)}` : 'Ver series'}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
