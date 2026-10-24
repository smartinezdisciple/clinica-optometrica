import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { PALETA, formatearMoneda, formatearNumero } from './formato'
import type { DatoGrafica } from './GraficaBarras'

interface GraficaPastelProps {
  data:    DatoGrafica[]
  height?: number
  moneda?: boolean
  vacio?:  string
}

export function GraficaPastel({
  data,
  height = 280,
  moneda = false,
  vacio = 'Sin datos en el período.',
}: GraficaPastelProps) {
  if (data.length === 0) {
    return (
      <div style={{ height }} className="flex items-center justify-center text-sm text-outline">
        {vacio}
      </div>
    )
  }

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={88}
            paddingAngle={2}
          >
            {data.map((_, indice) => (
              <Cell key={indice} fill={PALETA[indice % PALETA.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => (moneda ? formatearMoneda(Number(value)) : formatearNumero(Number(value)))}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
