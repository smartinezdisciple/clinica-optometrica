import type { EficienciaClinica } from '../types'

interface Props {
  data: EficienciaClinica
}

function Barra({ label, valor, total, color }: { label: string; valor: number; total: number; color: string }) {
  const pct = total > 0 ? Math.min(100, Math.round((valor / total) * 100)) : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <p className="text-on-surface">{label}</p>
        <p className="text-outline">{valor} / {total} <span className="font-semibold text-on-surface">({pct}%)</span></p>
      </div>
      <div className="h-2 rounded-full bg-surface-container overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export function PanelEficienciaClinica({ data }: Props) {
  return (
    <div className="space-y-4">
      <Barra label="Citas completadas" valor={data.citas_completadas_mes} total={data.citas_programadas_mes} color="bg-primary" />
      <Barra label="Consultas realizadas" valor={data.consultas_mes} total={Math.max(data.consultas_mes, 1)} color="bg-primary-container" />
      <Barra label="Recetas emitidas" valor={data.recetas_emitidas_mes} total={Math.max(data.recetas_emitidas_mes, 1)} color="bg-secondary" />
      <div className="pt-2 border-t border-surface-container flex items-center justify-between">
        <p className="text-sm text-on-surface-variant">Cumplimiento de agenda</p>
        <p className="text-lg font-extrabold font-headline text-primary">{data.porcentaje_completadas}%</p>
      </div>
    </div>
  )
}
