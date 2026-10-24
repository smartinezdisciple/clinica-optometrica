import { Link } from 'react-router-dom'
import type { StockBajo } from '../types'

interface Props {
  items: StockBajo[]
}

export function ListaStockBajo({ items }: Props) {
  if (items.length === 0) {
    return <p className="text-sm text-outline text-center py-6">Sin alertas de stock bajo</p>
  }
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={`${item.id_producto}-${item.sucursal_nombre}`} className="flex items-center justify-between gap-3 rounded-xl border border-surface-container p-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-on-surface truncate">{item.nombre_producto}</p>
            <p className="text-xs text-outline">{item.sucursal_nombre}</p>
          </div>
          <div className="text-right shrink-0">
            <p className={`text-xs font-bold ${item.alerta === 'critica' ? 'text-red-600' : 'text-amber-600'}`}>Stock: {item.cantidad} / mín. {item.stock_minimo}</p>
            <Link to="/inventario" className="text-[10px] font-semibold text-primary hover:underline">Ver inventario</Link>
          </div>
        </li>
      ))}
    </ul>
  )
}
