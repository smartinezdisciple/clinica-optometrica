import { Modal } from '@/components/ui/Modal'
import { Boton } from '@/components/ui/Boton'
import type { ReciboData } from '../types'

interface ComprobanteProps {
  recibo:  ReciboData | null
  onClose: () => void
}

function formatearMoneda(valor: number): string {
  return `₡${valor.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Comprobante de venta. Permite imprimir en una ventana aislada para no incluir
 * el resto de la interfaz en la impresión.
 */
export function Comprobante({ recibo, onClose }: ComprobanteProps) {
  function handleImprimir() {
    if (!recibo) return

    const filas = recibo.items
      .map((i) => {
        const serie = i.numero_serie ? `<div class="serie">Serie: ${i.numero_serie}</div>` : ''
        return `<tr>
          <td>${i.nombre_producto}${serie}</td>
          <td class="num">${i.cantidad}</td>
          <td class="num">${formatearMoneda(i.precio_unitario)}</td>
          <td class="num">${formatearMoneda(i.subtotal)}</td>
        </tr>`
      })
      .join('')

    const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8" />
      <title>Comprobante #${recibo.id_venta}</title>
      <style>
        * { font-family: 'Segoe UI', system-ui, sans-serif; }
        body { width: 300px; margin: 0 auto; padding: 16px; color: #1c1b1f; }
        h1 { font-size: 16px; text-align: center; margin: 0 0 4px; }
        .sub { text-align: center; font-size: 11px; color: #6b7280; margin-bottom: 12px; }
        .meta { font-size: 12px; margin-bottom: 12px; }
        .meta div { display: flex; justify-content: space-between; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th, td { padding: 4px 0; text-align: left; }
        th { border-bottom: 1px solid #d1d5db; }
        td.num, th.num { text-align: right; }
        .serie { font-size: 10px; color: #6b7280; }
        .total { margin-top: 12px; border-top: 1px solid #d1d5db; padding-top: 8px; font-size: 13px; }
        .total div { display: flex; justify-content: space-between; padding: 2px 0; }
        .total .gran { font-size: 16px; font-weight: 700; color: #00658d; }
      </style></head><body>
      <h1>Dr. Lentes — Clínica Optométrica</h1>
      <div class="sub">Comprobante de venta</div>
      <div class="meta">
        <div><span>N° venta</span><span>#${recibo.id_venta}</span></div>
        <div><span>Fecha</span><span>${new Date(recibo.fecha).toLocaleString('es-CR')}</span></div>
        <div><span>Cliente</span><span>${recibo.cliente}</span></div>
        <div><span>Método</span><span>${recibo.metodo}</span></div>
      </div>
      <table>
        <thead><tr><th>Producto</th><th class="num">Cant</th><th class="num">Precio</th><th class="num">Subt.</th></tr></thead>
        <tbody>${filas}</tbody>
      </table>
      <div class="total">
        <div><span>Subtotal</span><span>${formatearMoneda(recibo.subtotal)}</span></div>
        <div><span>Descuento</span><span>-${formatearMoneda(recibo.descuento)}</span></div>
        <div class="gran"><span>Total</span><span>${formatearMoneda(recibo.total)}</span></div>
        ${recibo.recibido != null ? `<div><span>Recibido</span><span>${formatearMoneda(recibo.recibido)}</span></div>` : ''}
        ${recibo.cambio != null ? `<div><span>Vuelto</span><span>${formatearMoneda(recibo.cambio)}</span></div>` : ''}
      </div>
      </body></html>`

    const ventana = window.open('', '_blank', 'width=380,height=640')
    if (!ventana) return
    ventana.document.write(html)
    ventana.document.close()
    ventana.focus()
    ventana.print()
  }

  return (
    <Modal isOpen={!!recibo} onClose={onClose} titulo="Venta registrada" maxWith="sm">
      {recibo && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col items-center gap-1 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[30px]">check_circle</span>
            </div>
            <p className="text-sm font-bold text-on-surface">Venta #{recibo.id_venta} completada</p>
            <p className="text-xs text-outline">{new Date(recibo.fecha).toLocaleString('es-CR')}</p>
          </div>

          <div className="rounded-2xl bg-surface-container-low p-4 text-sm flex flex-col gap-2">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Cliente</span>
              <span className="font-semibold text-on-surface text-right">{recibo.cliente}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Método</span>
              <span className="font-semibold text-on-surface">{recibo.metodo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">Artículos</span>
              <span className="font-semibold text-on-surface">
                {recibo.items.reduce((acc, i) => acc + i.cantidad, 0)}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1 text-sm">
            <div className="flex justify-between text-on-surface-variant">
              <span>Subtotal</span><span>{formatearMoneda(recibo.subtotal)}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Descuento</span><span>-{formatearMoneda(recibo.descuento)}</span>
            </div>
            <div className="flex justify-between text-lg font-extrabold text-on-surface border-t border-surface-container pt-1">
              <span>Total</span><span className="text-primary">{formatearMoneda(recibo.total)}</span>
            </div>
            {recibo.cambio != null && (
              <div className="flex justify-between text-on-surface-variant pt-1">
                <span>Vuelto</span><span>{formatearMoneda(recibo.cambio)}</span>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Boton type="button" variant="secundario" onClick={handleImprimir}>
              <span className="material-symbols-outlined text-[20px]">print</span>
              Imprimir
            </Boton>
            <Boton type="button" onClick={onClose}>Nueva venta</Boton>
          </div>
        </div>
      )}
    </Modal>
  )
}
