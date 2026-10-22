import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, type ApiResponse } from '@/lib/api'
import { Modal } from '@/components/ui/Modal'
import { Boton } from '@/components/ui/Boton'
import { Campo } from '@/components/ui/Campo'
import { CargadorIris } from '@/components/ui/CargadorIris'
import type { MetodoPago } from '../types'

interface ModalPagoProps {
  isOpen:    boolean
  onClose:   () => void
  total:     number
  procesando: boolean
  onConfirm: (datos: {
    idMetodoPago: number
    referencia:   string | null
    recibido:     number | null
    metodoNombre: string
  }) => void
}

function formatearMoneda(valor: number): string {
  return `₡${valor.toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/**
 * Modal de cobro: selecciona el método de pago y, para efectivo, calcula el
 * vuelto a partir del monto recibido.
 */
export function ModalPago({ isOpen, onClose, total, procesando, onConfirm }: ModalPagoProps) {
  const [idMetodo, setIdMetodo] = useState<number | null>(null)
  const [recibido, setRecibido] = useState('')
  const [referencia, setReferencia] = useState('')

  const { data: metodosResponse, isLoading } = useQuery({
    queryKey: ['ventas-metodos-pago'],
    queryFn: () => api.get<ApiResponse<MetodoPago[]>>('/ventas/metodos-pago'),
    enabled: isOpen,
  })
  const metodos = metodosResponse?.data ?? []

  const metodoSel = metodos.find((m) => m.id_metodo_pago === idMetodo) ?? null
  const esEfectivo = metodoSel?.tipo_metodo_pago === 'fisico'
  const montoRecibido = Number(recibido)
  const vuelto = !Number.isNaN(montoRecibido) ? montoRecibido - total : 0
  const pagoValido = metodoSel
    ? (!esEfectivo || (montoRecibido >= total))
    : false

  // Reinicia el formulario cada vez que se abre el modal
  useEffect(() => {
    if (isOpen) {
      setIdMetodo(null)
      setRecibido('')
      setReferencia('')
    }
  }, [isOpen])

  function handleConfirm() {
    if (!metodoSel) return
    onConfirm({
      idMetodoPago: metodoSel.id_metodo_pago,
      referencia:   referencia.trim() ? referencia.trim() : null,
      recibido:     esEfectivo ? montoRecibido : null,
      metodoNombre: metodoSel.nombre_metodo_pago,
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} titulo="Registrar pago" maxWith="md">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between rounded-2xl bg-primary/5 px-4 py-3">
          <span className="text-sm font-bold text-on-surface-variant">Total a cobrar</span>
          <span className="text-xl font-extrabold text-primary">{formatearMoneda(total)}</span>
        </div>

        {isLoading ? (
          <div className="py-8 flex justify-center"><CargadorIris /></div>
        ) : (
          <div className="flex flex-col gap-2">
            <span className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              Método de pago
            </span>
            <div className="grid grid-cols-2 gap-2">
              {metodos.map((m) => (
                <button
                  key={m.id_metodo_pago}
                  type="button"
                  onClick={() => setIdMetodo(m.id_metodo_pago)}
                  className={`px-4 py-3 rounded-xl border text-sm font-semibold text-left transition-all
                    ${idMetodo === m.id_metodo_pago
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-surface-container text-on-surface hover:border-primary/30'}`}
                >
                  {m.nombre_metodo_pago}
                </button>
              ))}
            </div>
          </div>
        )}

        {esEfectivo && (
          <div className="flex gap-3">
            <Campo
              id="pos-recibido"
              label="Monto recibido"
              type="number"
              min={0}
              step="0.01"
              icon="payments"
              value={recibido}
              onChange={(e) => setRecibido(e.target.value)}
              containerClassName="flex-1"
            />
            <div className="flex flex-col gap-1.5 flex-1">
              <span className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Vuelto
              </span>
              <div className={`rounded-xl py-3 px-4 text-sm font-bold ${vuelto < 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>
                {vuelto < 0 ? 'Insuficiente' : formatearMoneda(vuelto)}
              </div>
            </div>
          </div>
        )}

        {metodoSel && !esEfectivo && (
          <Campo
            id="pos-referencia"
            label="Referencia (opcional)"
            icon="receipt_long"
            maxLength={80}
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
            placeholder="N° de transacción, autorización…"
          />
        )}

        <div className="flex justify-end gap-2 pt-1">
          <Boton type="button" variant="secundario" onClick={onClose} disabled={procesando}>
            Cancelar
          </Boton>
          <Boton type="button" onClick={handleConfirm} disabled={!pagoValido} isLoading={procesando}>
            Confirmar venta
          </Boton>
        </div>
      </div>
    </Modal>
  )
}
