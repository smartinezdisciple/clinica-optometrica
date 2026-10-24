import type { CitaProxima } from '../types'

function formatearHora(fechaIso: string) {
  try {
    const d = new Date(fechaIso)
    return d.toLocaleTimeString('es-NI', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return '--:--'
  }
}

function formatearFecha(fechaIso: string) {
  try {
    const d = new Date(fechaIso)
    return d.toLocaleDateString('es-NI', { day: '2-digit', month: 'short' })
  } catch {
    return '--'
  }
}

const ESTADO: Record<string, string> = {
  confirmada: 'bg-emerald-50 text-emerald-700',
  en_espera_confirmacion: 'bg-amber-50 text-amber-700',
  reprogramada: 'bg-sky-50 text-sky-700',
  completada: 'bg-slate-100 text-slate-600',
  cancelada: 'bg-rose-50 text-rose-700',
}

interface Props {
  citas: CitaProxima[]
}

export function ListaProximasCitas({ citas }: Props) {
  if (citas.length === 0) {
    return <p className="text-sm text-outline text-center py-6">No hay citas próximas</p>
  }
  return (
    <ul className="divide-y divide-surface-container">
      {citas.map((cita) => (
        <li key={cita.id_cita} className="py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[20px]">event</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-on-surface truncate">{cita.paciente}</p>
            <p className="text-xs text-outline truncate">{cita.motivo_cita}{cita.optometrista ? ` · ${cita.optometrista}` : ''}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs font-semibold text-on-surface">{formatearHora(cita.fecha_hora_cita)}</p>
            <p className="text-[10px] text-outline">{formatearFecha(cita.fecha_hora_cita)}</p>
            <span className={`mt-1 inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${ESTADO[cita.estado_cita] || 'bg-slate-100 text-slate-600'}`}>
              {cita.estado_cita.replace('_', ' ')}
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}
