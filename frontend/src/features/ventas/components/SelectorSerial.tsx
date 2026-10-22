import { useQuery } from '@tanstack/react-query'
import { api, type ApiResponse } from '@/lib/api'
import { Modal } from '@/components/ui/Modal'
import { CargadorIris } from '@/components/ui/CargadorIris'
import type { ProductoVendible, UnidadSerializada } from '../types'

interface SelectorSerialProps {
  producto: ProductoVendible | null
  isOpen:   boolean
  onClose:  () => void
  onSelect: (unidad: UnidadSerializada) => void
  /** Unidades ya agregadas al carrito (para deshabilitarlas en la lista). */
  excluidas?: number[]
}

/**
 * Modal para elegir una unidad serializada disponible de un producto.
 * Se usa cuando el producto controla inventario por número de serie.
 */
export function SelectorSerial({ producto, isOpen, onClose, onSelect, excluidas = [] }: SelectorSerialProps) {
  const { data: unidadesResponse, isLoading } = useQuery({
    queryKey: ['ventas-seriales', producto?.id_producto],
    queryFn: () => api.get<ApiResponse<UnidadSerializada[]>>(
      `/ventas/seriales-disponibles?productoId=${producto!.id_producto}`,
    ),
    enabled: isOpen && !!producto,
  })

  const unidades = unidadesResponse?.data ?? []

  return (
    <Modal isOpen={isOpen} onClose={onClose} titulo={`Series · ${producto?.nombre_producto ?? ''}`} maxWith="md">
      {isLoading ? (
        <div className="py-12 flex justify-center"><CargadorIris /></div>
      ) : unidades.length === 0 ? (
        <p className="py-8 text-center text-sm text-outline">
          No hay unidades disponibles para este producto.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {unidades.map((u) => {
            const yaEnCarrito = excluidas.includes(u.id_unidad)
            return (
              <li key={u.id_unidad}>
                <button
                  type="button"
                  disabled={yaEnCarrito}
                  onClick={() => onSelect(u)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-surface-container
                    text-sm text-left transition-all hover:border-primary/40 hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="font-semibold text-on-surface font-mono">{u.numero_serie}</span>
                  <span className="material-symbols-outlined text-[18px] text-primary">
                    {yaEnCarrito ? 'check' : 'add_circle'}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </Modal>
  )
}
