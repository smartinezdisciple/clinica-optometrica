import { Campo } from '@/components/ui/Campo'
import { Tarjeta } from '@/components/ui/Tarjeta'
import type { Sucursal } from '@/features/sucursales/types'
import { PRESETS, type PresetRango } from '../types'

interface BarraFiltrosProps {
  desde:      string
  hasta:      string
  preset:     PresetRango
  idSucursal: string
  sucursales: Sucursal[]
  onPreset:   (preset: Exclude<PresetRango, 'personalizado'>) => void
  onDesde:    (valor: string) => void
  onHasta:    (valor: string) => void
  onSucursal: (valor: string) => void
}

export function BarraFiltros({
  desde,
  hasta,
  preset,
  idSucursal,
  sucursales,
  onPreset,
  onDesde,
  onHasta,
  onSucursal,
}: BarraFiltrosProps) {
  return (
    <Tarjeta>
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <span className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">
            Período
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.valor}
                type="button"
                onClick={() => onPreset(p.valor as Exclude<PresetRango, 'personalizado'>)}
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all
                  ${preset === p.valor
                    ? 'bg-primary text-white shadow-primary-glow'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                {p.etiqueta}
              </button>
            ))}
          </div>
        </div>

        <Campo
          id="reporte-desde"
          label="Desde"
          type="date"
          value={desde}
          max={hasta}
          onChange={(e) => onDesde(e.target.value)}
          containerClassName="w-44"
        />
        <Campo
          id="reporte-hasta"
          label="Hasta"
          type="date"
          value={hasta}
          min={desde}
          onChange={(e) => onHasta(e.target.value)}
          containerClassName="w-44"
        />

        <div className="flex flex-col gap-1.5 ml-auto">
          <label
            htmlFor="reporte-sucursal"
            className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider"
          >
            Sucursal
          </label>
          <select
            id="reporte-sucursal"
            value={idSucursal}
            onChange={(e) => onSucursal(e.target.value)}
            className="bg-surface-container-low border border-transparent rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 min-w-52"
          >
            <option value="">Todas las sucursales</option>
            {sucursales.map((s) => (
              <option key={s.id_sucursal} value={String(s.id_sucursal)}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Tarjeta>
  )
}
