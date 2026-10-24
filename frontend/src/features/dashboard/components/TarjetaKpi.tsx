import type { ReactNode } from 'react'

interface TarjetaKpiProps {
  titulo: string
  valor: string
  subtitulo?: string
  icono: string
  tendencia?: string
  color?: 'primary' | 'secondary' | 'tertiary'
  children?: ReactNode
}

const COLORES = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  tertiary: 'text-tertiary',
}

export function TarjetaKpi({ titulo, valor, subtitulo, icono, tendencia, color = 'primary', children }: TarjetaKpiProps) {
  return (
    <article className="bg-white rounded-2xl border border-surface-container shadow-[0_2px_12px_rgba(0,101,141,.05)] overflow-hidden animate-fade-up">
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-outline font-medium">{titulo}</p>
          <p className="mt-1 text-2xl font-extrabold font-headline text-on-surface truncate">{valor}</p>
          {subtitulo && <p className="mt-0.5 text-xs text-on-surface-variant">{subtitulo}</p>}
          {tendencia && <p className="mt-1 text-[10px] text-outline">{tendencia}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center ${COLORES[color]} shrink-0`}>
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icono}</span>
        </div>
      </div>
      {children && <div className="px-4 pb-4">{children}</div>}
    </article>
  )
}
