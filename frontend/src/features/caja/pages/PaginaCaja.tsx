import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api, type ApiResponse } from '@/lib/api'
import { Tarjeta } from '@/components/ui/Tarjeta'
import { Tabla } from '@/components/ui/Tabla'
import { Insignia } from '@/components/ui/Insignia'
import { Boton } from '@/components/ui/Boton'
import { Campo } from '@/components/ui/Campo'
import { Modal } from '@/components/ui/Modal'
import { CargadorIris } from '@/components/ui/CargadorIris'
import type { Caja, EstadoCaja, MovimientoCaja } from '../types'
import { TIPO_MOVIMIENTO_LABEL } from '../types'

const inputCls =
  'w-full bg-surface-container-low border border-transparent rounded-xl py-2.5 px-4 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary/30'

export default function PaginaCaja() {
  const queryClient = useQueryClient()
  const [cajaSeleccionada, setCajaSeleccionada] = useState<number | ''>('')

  const [modalCrear, setModalCrear] = useState(false)
  const [modalAbrir, setModalAbrir] = useState(false)
  const [modalMovimiento, setModalMovimiento] = useState(false)
  const [modalCierre, setModalCierre] = useState(false)

  const [nombreNueva, setNombreNueva] = useState('')
  const [montoInicial, setMontoInicial] = useState('0')
  const [tipoMov, setTipoMov] = useState<'ingreso' | 'egreso' | 'ajuste'>('ingreso')
  const [montoMov, setMontoMov] = useState('')
  const [descMov, setDescMov] = useState('')
  const [montoFinal, setMontoFinal] = useState('')
  const [enviando, setEnviando] = useState(false)

  const { data: cajasResp } = useQuery({
    queryKey: ['caja-cajas'],
    queryFn: () => api.get<ApiResponse<Caja[]>>('/caja/cajas'),
    refetchInterval: 15000,
  })
  const cajas = cajasResp?.data ?? []

  const { data: estadoResp, isLoading: cargandoEstado } = useQuery({
    queryKey: ['caja-estado', cajaSeleccionada],
    queryFn: () => api.get<ApiResponse<EstadoCaja>>(`/caja/cajas/${cajaSeleccionada}/estado`),
    enabled: cajaSeleccionada !== '',
  })
  const estado = estadoResp?.data

  const { data: movResp, isLoading: cargandoMov } = useQuery({
    queryKey: ['caja-movimientos', cajaSeleccionada],
    queryFn: () => api.get<ApiResponse<MovimientoCaja[]>>(`/caja/cajas/${cajaSeleccionada}/movimientos`),
    enabled: cajaSeleccionada !== '',
    refetchInterval: 15000,
  })
  const movimientos = movResp?.data ?? []

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ['caja-cajas'] })
    queryClient.invalidateQueries({ queryKey: ['caja-estado', cajaSeleccionada] })
    queryClient.invalidateQueries({ queryKey: ['caja-movimientos', cajaSeleccionada] })
  }

  const crearCaja = async () => {
    if (!nombreNueva.trim()) return toast.error('Ingresa el nombre de la caja')
    try {
      setEnviando(true)
      const res = await api.post<ApiResponse<Caja>>('/caja/cajas', { nombre_caja: nombreNueva.trim() })
      setCajaSeleccionada(res.data.id_caja)
      toast.success('Caja creada')
      setModalCrear(false)
      setNombreNueva('')
      invalidar()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo crear la caja')
    } finally {
      setEnviando(false)
    }
  }

  const abrirCaja = async () => {
    if (cajaSeleccionada === '') return
    try {
      setEnviando(true)
      await api.post(`/caja/cajas/${cajaSeleccionada}/aperturas`, { monto_inicial: Number(montoInicial) || 0 })
      toast.success('Caja abierta')
      setModalAbrir(false)
      invalidar()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo abrir la caja')
    } finally {
      setEnviando(false)
    }
  }

  const registrarMovimiento = async () => {
    if (cajaSeleccionada === '') return
    const monto = Number(montoMov)
    if (montoMov === '' || monto <= 0) return toast.error('Ingresa un monto válido')
    try {
      setEnviando(true)
      await api.post(`/caja/cajas/${cajaSeleccionada}/movimientos`, {
        tipo_movimiento: tipoMov,
        monto:           monto,
        descripcion:     descMov.trim() || null,
      })
      toast.success('Movimiento registrado')
      setModalMovimiento(false)
      setMontoMov('')
      setDescMov('')
      invalidar()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo registrar el movimiento')
    } finally {
      setEnviando(false)
    }
  }

  const cerrarCaja = async () => {
    if (cajaSeleccionada === '') return
    const final = Number(montoFinal)
    if (montoFinal === '' || final < 0) return toast.error('Ingresa el monto final contado')
    try {
      setEnviando(true)
      const res = await api.post<ApiResponse<{ diferencia: number }>>(
        `/caja/cajas/${cajaSeleccionada}/cierres`,
        { monto_final: final },
      )
      const dif = Number(res.data.diferencia)
      toast.success(dif === 0 ? 'Caja cuadrada' : dif > 0 ? `Caja cerrada con S/ ${dif.toFixed(2)} de sobrante` : `Caja cerrada con S/ ${Math.abs(dif).toFixed(2)} de faltante`)
      setModalCierre(false)
      setMontoFinal('')
      invalidar()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo cerrar la caja')
    } finally {
      setEnviando(false)
    }
  }

  const columnasMov = [
    {
      key: 'fecha_movimiento',
      label: 'Fecha',
      render: (row: MovimientoCaja) => (
        <span>
          {new Date(row.fecha_movimiento).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
        </span>
      ),
    },
    {
      key: 'tipo_movimiento',
      label: 'Tipo',
      render: (row: MovimientoCaja) => {
        const variant = row.tipo_movimiento === 'ingreso' ? 'exito' : row.tipo_movimiento === 'egreso' ? 'error' : 'advertencia'
        return (
          <Insignia variant={variant as 'exito' | 'error' | 'advertencia'}>
            {TIPO_MOVIMIENTO_LABEL[row.tipo_movimiento]}
          </Insignia>
        )
      },
    },
    { key: 'descripcion', label: 'Descripción', render: (row: MovimientoCaja) => <span>{row.descripcion ?? '—'}</span> },
    {
      key: 'monto',
      label: 'Monto',
      className: 'text-right',
      render: (row: MovimientoCaja) => (
        <span className={`font-mono font-semibold ${row.tipo_movimiento === 'egreso' ? 'text-red-500' : row.tipo_movimiento === 'ingreso' ? 'text-emerald-600' : 'text-amber-600'}`}>
          {row.tipo_movimiento === 'egreso' ? '-' : '+'} S/ {Number(row.monto).toFixed(2)}
        </span>
      ),
    },
  ]

  const hayCajaAbierta = Boolean(estado?.resumen.aperturaActiva)

  return (
    <div className="p-8 animate-fade-up space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold font-headline text-on-surface">Caja</h1>
          <p className="text-sm text-outline mt-1">
            Apertura, movimientos y cierre de caja
          </p>
        </div>
        <div className="flex gap-3">
          <Boton variant="secundario" type="button" onClick={() => setModalCrear(true)}>
            <span className="material-symbols-outlined text-[18px]">add_business</span>
            Nueva caja
          </Boton>
          {estado && !hayCajaAbierta && (
            <Boton type="button" onClick={() => setModalAbrir(true)}>
              <span className="material-symbols-outlined text-[18px]">point_of_sale</span>
              Abrir caja
            </Boton>
          )}
        </div>
      </div>

      {/* Selector de caja */}
      <Tarjeta titulo="Selecciona una caja">
        <select className={inputCls} value={cajaSeleccionada} onChange={(e) => setCajaSeleccionada(Number(e.target.value))}>
          <option value="">Selecciona una caja…</option>
          {cajas.map((c) => (
            <option key={c.id_caja} value={c.id_caja}>
              {c.nombre_caja} {c.activa ? '' : '· inactiva'}
            </option>
          ))}
        </select>
      </Tarjeta>

      {/* Resumen */}
      {estado && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Tarjeta titulo="Estado">
            {hayCajaAbierta ? (
              <Insignia variant="exito">Caja abierta</Insignia>
            ) : (
              <Insignia variant="neutro">Caja cerrada</Insignia>
            )}
          </Tarjeta>
          <Tarjeta titulo="Monto inicial">
            <p className="text-2xl font-extrabold font-mono text-on-surface">S/ {Number(estado.resumen.montoInicial).toFixed(2)}</p>
          </Tarjeta>
          <Tarjeta titulo="Saldo esperado">
            <p className="text-2xl font-extrabold font-mono text-primary">S/ {Number(estado.resumen.saldoEsperado).toFixed(2)}</p>
          </Tarjeta>
          <Tarjeta titulo="Acciones">
            <div className="flex flex-wrap gap-2">
              {hayCajaAbierta && (
                <>
                  <Boton type="button" className="px-3 py-1.5 text-xs" onClick={() => setModalMovimiento(true)}>
                    Movimiento
                  </Boton>
                  <Boton variant="secundario" type="button" className="px-3 py-1.5 text-xs" onClick={() => setModalCierre(true)}>
                    Cerrar caja
                  </Boton>
                </>
              )}
            </div>
          </Tarjeta>
        </div>
      )}

      {cajaSeleccionada !== '' && (
        <Tarjeta titulo="Movimientos de caja">
          {cargandoMov ? (
            <div className="py-14 flex justify-center"><CargadorIris size={44} /></div>
          ) : (
            <Tabla columns={columnasMov} data={movimientos} emptyMessage="Aun no hay movimientos registrados en esta caja." />
          )}
        </Tarjeta>
      )}

      {cargandoEstado && cajaSeleccionada !== '' && (
        <div className="py-10 flex justify-center"><CargadorIris size={44} /></div>
      )}

      {/* Modal nueva caja */}
      <Modal isOpen={modalCrear} onClose={() => setModalCrear(false)} titulo="Nueva caja">
        <Campo label="Nombre de la caja" value={nombreNueva} onChange={(e) => setNombreNueva(e.target.value)} />
        <div className="flex justify-end gap-3 mt-6">
          <Boton variant="fantasma" type="button" onClick={() => setModalCrear(false)}>Cancelar</Boton>
          <Boton type="button" isLoading={enviando} onClick={crearCaja}>Crear caja</Boton>
        </div>
      </Modal>

      {/* Modal abrir caja */}
      <Modal isOpen={modalAbrir} onClose={() => setModalAbrir(false)} titulo="Abrir caja">
        <Campo
          label="Monto inicial (S/)"
          type="number"
          min="0"
          step="0.01"
          value={montoInicial}
          onChange={(e) => setMontoInicial(e.target.value)}
        />
        <div className="flex justify-end gap-3 mt-6">
          <Boton variant="fantasma" type="button" onClick={() => setModalAbrir(false)}>Cancelar</Boton>
          <Boton type="button" isLoading={enviando} onClick={abrirCaja}>Abrir caja</Boton>
        </div>
      </Modal>

      {/* Modal movimiento */}
      <Modal isOpen={modalMovimiento} onClose={() => setModalMovimiento(false)} titulo="Registrar movimiento">
        <div className="space-y-4">
          <div className="flex gap-2">
            {(['ingreso', 'egreso', 'ajuste'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTipoMov(t)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  tipoMov === t ? 'bg-primary-gradient text-white shadow-primary-glow' : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                {TIPO_MOVIMIENTO_LABEL[t]}
              </button>
            ))}
          </div>
          <Campo
            label="Monto (S/)"
            type="number"
            min="0.01"
            step="0.01"
            value={montoMov}
            onChange={(e) => setMontoMov(e.target.value)}
          />
          <Campo
            label="Descripción"
            value={descMov}
            onChange={(e) => setDescMov(e.target.value)}
            placeholder="Opcional"
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Boton variant="fantasma" type="button" onClick={() => setModalMovimiento(false)}>Cancelar</Boton>
          <Boton type="button" isLoading={enviando} onClick={registrarMovimiento}>Registrar</Boton>
        </div>
      </Modal>

      {/* Modal cierre */}
      <Modal isOpen={modalCierre} onClose={() => setModalCierre(false)} titulo="Cerrar caja">
        <div className="space-y-4">
          <div className="rounded-xl bg-surface-container-low p-4 text-sm">
            <div className="flex justify-between"><span className="text-outline">Monto inicial</span><strong className="font-mono">S/ {Number(estado?.resumen.montoInicial ?? 0).toFixed(2)}</strong></div>
            <div className="flex justify-between mt-1"><span className="text-outline">Ingresos</span><strong className="font-mono text-emerald-600">S/ {Number(estado?.resumen.totalIngresos ?? 0).toFixed(2)}</strong></div>
            <div className="flex justify-between mt-1"><span className="text-outline">Egresos</span><strong className="font-mono text-red-500">S/ {Number(estado?.resumen.totalEgresos ?? 0).toFixed(2)}</strong></div>
            <div className="flex justify-between mt-1"><span className="text-outline">Ajustes</span><strong className="font-mono text-amber-600">S/ {Number(estado?.resumen.totalAjustes ?? 0).toFixed(2)}</strong></div>
            <div className="flex justify-between mt-2 pt-2 border-t border-surface-container"><span className="font-bold">Saldo esperado</span><strong className="font-mono text-primary">S/ {Number(estado?.resumen.saldoEsperado ?? 0).toFixed(2)}</strong></div>
          </div>
          <Campo
            label="Monto final contado (S/)"
            type="number"
            min="0"
            step="0.01"
            value={montoFinal}
            onChange={(e) => setMontoFinal(e.target.value)}
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Boton variant="fantasma" type="button" onClick={() => setModalCierre(false)}>Cancelar</Boton>
          <Boton type="button" isLoading={enviando} onClick={cerrarCaja}>Cerrar caja</Boton>
        </div>
      </Modal>
    </div>
  )
}