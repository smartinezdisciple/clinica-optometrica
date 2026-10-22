import { Boton } from '@/components/ui/Boton'
import { Campo } from '@/components/ui/Campo'
import { SelectorCliente } from './SelectorCliente'
import type { ClienteVenta, ItemCarrito } from '../types'

interface CarritoProps {
  items:                 ItemCarrito[]
  cliente:               ClienteVenta | null
  onClienteChange:       (cliente: ClienteVenta | null) => void
  clienteError?:         string
  descuentoPorcentaje:   number
  onDescuentoChange:     (valor: number) => void
  nota:                  string
  onNotaChange:          (valor: string) => void
  subtotal:              number
  descuentoMonto:        number
  total:                 number
  onCambiarCantidad:     (uid: string, cantidad: number) => void
  onQuitar:              (uid: string) => void
  onVaciar:              () => void
  onCobrar:              () => void
  cobrando:              boolean
}

const inputCls = 'w-full bg-surface-container-low border border-transparent rounded-xl py-3 px-4 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary/30'

function formatearMoneda(valor: number): string {
  return `₡${valor.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Panel del carrito de venta: cliente, líneas de artículos, descuento, nota y
 * totales. Dispara el cobro hacia el modal de pago.
 */
export function Carrito({
  items,
  cliente,
  onClienteChange,
  clienteError,
  descuentoPorcentaje,
  onDescuentoChange,
  nota,
  onNotaChange,
  subtotal,
  descuentoMonto,
  total,
  onCambiarCantidad,
  onQuitar,
  onVaciar,
  onCobrar,
  cobrando,
}: CarritoProps) {
  const vacio = items.length === 0

  return (
    <div className="flex flex-col gap-4 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-on-surface font-headline">
          Carrito <span className="text-outline font-semibold">({items.length})</span>
        </h2>
        {!vacio && (
          <button
            type="button"
            onClick={onVaciar}
            className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors"
          >
            Vaciar
          </button>
        )}
      </div>

      <SelectorCliente value={cliente} onChange={onClienteChange} error={clienteError} />

      <div className="flex-1 min-h-[8rem] overflow-y-auto flex flex-col gap-2 pr-1">
        {vacio ? (
          <div className="flex-1 flex flex-col items-center justify-center text-outline py-10">
            <span className="material-symbols-outlined text-3xl">shopping_cart</span>
            <p className="text-sm mt-2">Agrega productos para comenzar.</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.uid}
              className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-on-surface truncate">
                  {item.nombre_producto}
                </p>
                {item.numero_serie && (
                  <p className="text-[11px] text-on-surface-variant font-mono">Serie: {item.numero_serie}</p>
                )}
                <p className="text-xs text-primary font-bold mt-0.5">
                  {formatearMoneda(item.precio_unitario)}
                </p>
              </div>

              {item.tipo_manejo === 'granel' ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => onCambiarCantidad(item.uid, item.cantidad - 1)}
                    className="w-7 h-7 rounded-lg bg-white border border-surface-container flex items-center justify-center text-on-surface hover:border-primary/40"
                    aria-label="Disminuir cantidad"
                  >
                    <span className="material-symbols-outlined text-[16px]">remove</span>
                  </button>
                  <span className="w-7 text-center text-sm font-bold text-on-surface">{item.cantidad}</span>
                  <button
                    type="button"
                    onClick={() => onCambiarCantidad(item.uid, item.cantidad + 1)}
                    disabled={item.cantidad >= item.stock}
                    className="w-7 h-7 rounded-lg bg-white border border-surface-container flex items-center justify-center text-on-surface hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Aumentar cantidad"
                  >
                    <span className="material-symbols-outlined text-[16px]">add</span>
                  </button>
                </div>
              ) : (
                <span className="text-xs font-bold text-on-surface-variant shrink-0">x1</span>
              )}

              <button
                type="button"
                onClick={() => onQuitar(item.uid)}
                className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-outline hover:text-red-500 hover:bg-red-50 transition-colors"
                aria-label="Quitar artículo"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          ))
        )}
      </div>

      <div className="flex flex-col gap-3 border-t border-surface-container pt-4">
        <div className="flex gap-3">
          <Campo
            id="pos-descuento"
            label="Descuento (%)"
            type="number"
            min={0}
            max={100}
            step={1}
            value={descuentoPorcentaje === 0 ? '' : descuentoPorcentaje}
            onChange={(e) => {
              const v = Number(e.target.value)
              onDescuentoChange(Math.min(100, Math.max(0, Number.isNaN(v) ? 0 : v)))
            }}
            containerClassName="w-32"
          />
          <div className="flex flex-col gap-1.5 flex-1">
            <label htmlFor="pos-nota" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Nota
            </label>
            <textarea
              id="pos-nota"
              rows={1}
              maxLength={300}
              value={nota}
              onChange={(e) => onNotaChange(e.target.value)}
              placeholder="Observaciones…"
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 text-sm">
          <div className="flex justify-between text-on-surface-variant">
            <span>Subtotal</span>
            <span>{formatearMoneda(subtotal)}</span>
          </div>
          <div className="flex justify-between text-on-surface-variant">
            <span>Descuento</span>
            <span>-{formatearMoneda(descuentoMonto)}</span>
          </div>
          <div className="flex justify-between text-lg font-extrabold text-on-surface pt-1 border-t border-surface-container mt-1">
            <span>Total</span>
            <span className="text-primary">{formatearMoneda(total)}</span>
          </div>
        </div>

        <Boton
          type="button"
          onClick={onCobrar}
          disabled={vacio}
          isLoading={cobrando}
          className="w-full"
        >
          <span className="material-symbols-outlined text-[20px]">point_of_sale</span>
          Cobrar
        </Boton>
      </div>
    </div>
  )
}
