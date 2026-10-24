import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { VentaMensual } from '../types'

function formatoMoneda(valor: number) {
  return `C$${valor.toLocaleString('es-NI', { maximumFractionDigits: 0 })}`
}

interface Props {
  datos: VentaMensual[]
}

export function GraficaVentasMensuales({ datos }: Props) {
  const data = datos.map((d) => ({ name: d.label, total: d.total_monto }))
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgba(71,85,105,0.8)' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={formatoMoneda} tick={{ fontSize: 11, fill: 'rgba(71,85,105,0.8)' }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value: any) => [formatoMoneda(Number(value ?? 0)), 'Ingresos']}
            contentStyle={{ borderRadius: 12, border: '1px solid rgba(148,163,184,0.4)', fontSize: 12 }}
          />
          <Bar dataKey="total" fill="#00658d" radius={[8, 8, 4, 4]} maxBarSize={36} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
