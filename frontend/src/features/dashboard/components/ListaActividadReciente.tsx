import type { ActividadReciente } from '../types'

function formatearFechaHora(fechaIso: string) {
  try {
    const d = new Date(fechaIso)
    return d.toLocaleString('es-NI', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  } catch {
    return fechaIso
  }
}

interface Props {
  items: ActividadReciente[]
}

const ICONOS: Record<string, string> = {
  CREATE: 'add_circle',
  UPDATE: 'edit',
  DELETE: 'delete',
  LOGIN: 'login',
  LOGOUT: 'logout',
}

export function ListaActividadReciente({ items }: Props) {
  if (items.length === 0) {
    return <p className="text-sm text-outline text-center py-6">Sin actividad reciente</p>
  }
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id_log} className="flex items-start gap-3 rounded-xl border border-surface-container p-3">
          <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined text-[18px]">{ICONOS[item.tipo_evento || ''] || 'history'}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-on-surface">{item.accion}</p>
            {item.descripcion && <p className="text-xs text-outline truncate">{item.descripcion}</p>}
            <p className="mt-0.5 text-[10px] text-outline">{item.usuario ? `${item.usuario} · ` : ''}{formatearFechaHora(item.fecha_evento)}{item.modulo ? ` · ${item.modulo}` : ''}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
