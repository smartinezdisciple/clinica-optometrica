import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatearMoneda, formatearNumero } from './formato'

export interface DatoGrafica {
  name:  string
  value: number
}

interface GraficaBarrasProps {
  data:     DatoGrafica[]
  color?:   string
  height?:  number
  moneda?:  boolean
  vacio?:   string
}

export function GraficaBarras({
  data,
  color = '#00658d',
  height = 280,
  moneda = false,
  vacio = 'Sin datos en el período.',
}: GraficaBarrasProps) {
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
        <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eceef0" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 11, fill: '#41484d' }}
            tickLine={false}
            axisLine={false}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#41484d' }}
            tickLine={false}
            axisLine={false}
            width={64}
          />
          <Tooltip
            cursor={{ fill: 'rgba(0, 101, 141, 0.06)' }}
            formatter={(value) => (moneda ? formatearMoneda(Number(value)) : formatearNumero(Number(value)))}
          />
          <Bar dataKey="value" name="Total" fill={color} radius={[8, 8, 0, 0]} maxBarSize={46} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
