// Stub — Dashboard migrado a React (Sprint 2)
export default function PaginaDashboard() {
  return (
    <div className="p-8">
      <div className="animate-fade-up">
        <h1 className="font-headline font-extrabold text-2xl text-on-surface mb-2">Panel de Control</h1>
        <p className="text-outline text-sm">Dashboard React — Migración en Sprint 2</p>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Ventas Hoy', 'Citas Hoy', 'Stock Bajo', 'Pacientes'].map((kpi, i) => (
            <div key={kpi} className="bg-white rounded-2xl border border-surface-container p-4 animate-fade-up" style={{ animationDelay: `${i * 0.08}s` }}>
              <p className="text-xs text-outline mb-1">{kpi}</p>
              <p className="text-2xl font-extrabold font-headline text-primary">—</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
