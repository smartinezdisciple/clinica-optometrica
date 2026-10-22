import { Tarjeta } from '@/components/ui/Tarjeta'

export type TonoKPI = 'primario' | 'exito' | 'advertencia' | 'error'

export interface ItemKPI {
  label:  string
  valor:  string
  icono:  string
  tono?:  TonoKPI
  detalle?: string
}

const TONOS: Record<TonoKPI, string> = {
  primario:    'bg-primary/10 text-primary',
  exito:       'bg-emerald-50 text-emerald-700',
  advertencia: 'bg-amber-50 text-amber-700',
  error:       'bg-red-50 text-red-600',
}

export function TarjetasKPI({ items }: { items: ItemKPI[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {items.map((item) => (
        <Tarjeta key={item.label} className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${TONOS[item.tono ?? 'primario']}`}>
            <span className="material-symbols-outlined text-[24px]">{item.icono}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider truncate">
              {item.label}
            </p>
            <p className="text-2xl font-extrabold text-on-surface truncate">{item.valor}</p>
            {item.detalle && (
              <p className="text-[11px] text-outline truncate">{item.detalle}</p>
            )}
          </div>
        </Tarjeta>
      ))}
    </div>
  )
}
