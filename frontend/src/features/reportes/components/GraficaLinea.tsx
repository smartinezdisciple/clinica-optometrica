import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatearMoneda, formatearNumero } from './formato'
import type { DatoGrafica } from './GraficaBarras'

interface GraficaLineaProps {
  data:    DatoGrafica[]
  color?:  string
  height?: number
  moneda?: boolean
  vacio?:  string
}

export function GraficaLinea({
  data,
  color = '#00658d',
  height = 280,
  moneda = false,
  vacio = 'Sin datos en el período.',
}: GraficaLineaProps) {
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
        <LineChart data={data} margin={{ top: 8, right: 12, left: -8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eceef0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#41484d' }}
            tickLine={false}
            axisLine={false}
            minTickGap={18}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#41484d' }}
            tickLine={false}
            axisLine={false}
            width={64}
          />
          <Tooltip
            formatter={(value) => (moneda ? formatearMoneda(Number(value)) : formatearNumero(Number(value)))}
          />
          <Line
            type="monotone"
            dataKey="value"
            name="Total"
            stroke={color}
            strokeWidth={2.5}
            dot={{ r: 2.5, fill: color }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
