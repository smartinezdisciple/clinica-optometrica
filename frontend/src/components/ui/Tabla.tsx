import { type ReactNode } from 'react'

interface Column {
  key: string
  label: string
  render?: (row: any) => ReactNode
  className?: string
}

interface TablaProps {
  columns: Column[]
  data:    any[]
  emptyMessage?: string
  onRowClick?: (row: any) => void
}

export function Tabla({
  columns,
  data,
  emptyMessage = 'No se encontraron registros.',
  onRowClick,
}: TablaProps) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-surface-container bg-white">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface-container-low border-b border-surface-container">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`px-5 py-3 text-xs font-bold text-on-surface-variant uppercase tracking-wider ${col.className || ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-container/50">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-5 py-8 text-center text-sm text-outline"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={row.id || index}
                onClick={() => onRowClick?.(row)}
                className={`transition-all duration-150
                  ${onRowClick ? 'cursor-pointer hover:bg-primary/5' : 'hover:bg-surface-container-lowest'}`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-5 py-4 text-sm text-on-surface truncate max-w-[250px] ${col.className || ''}`}
                  >
                    {col.render ? col.render(row) : row[col.key] ?? '-'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
