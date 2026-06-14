import { useNavigate } from 'react-router-dom'

export default function PaginaNoEncontrada() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-4xl text-primary/40" style={{ fontVariationSettings: "'FILL' 1" }}>search_off</span>
      </div>
      <h1 className="font-headline font-extrabold text-4xl text-on-surface mb-2">404</h1>
      <p className="text-outline text-sm mb-8">Esta página no existe o fue movida.</p>
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 bg-primary-gradient text-white px-6 py-3 rounded-xl font-bold text-sm shadow-primary-glow hover:-translate-y-0.5 transition-all">
        <span className="material-symbols-outlined text-base">home</span>
        Ir al Tablero
      </button>
    </div>
  )
}
