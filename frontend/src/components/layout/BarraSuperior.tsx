import { useLocation } from 'react-router-dom'
import { useUIStore, useAuthStore } from '@/lib/store'

const BREADCRUMB_MAP: Record<string, string> = {
  '/dashboard':           'Tablero',
  '/ventas':              'Ventas',
  '/citas':               'Citas',
  '/inventario':          'Inventario',
  '/historias-clinicas':  'Historias Clínicas',
  '/reportes':            'Reportes',
  '/caja':                'Caja',
  '/configuracion':       'Configuración',
}

export function BarraSuperior() {
  const { toggleSidebar } = useUIStore()
  const { usuario } = useAuthStore()
  const location = useLocation()

  const pageLabel = BREADCRUMB_MAP[location.pathname] ?? 'Sistema'

  return (
    <header
      className="fixed top-0 right-0 h-14 z-40 glass border-b border-surface-container
        flex items-center justify-between px-5 w-full lg:w-[calc(100%-16rem)] sidebar-transition"
      role="banner"
    >
      <div className="flex items-center gap-3">
        {/* Hamburger — solo móvil */}
        <button
          onClick={toggleSidebar}
          className="p-1.5 hover:bg-surface-container rounded-lg transition-colors text-on-surface-variant lg:hidden"
          aria-label="Abrir menú"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        {/* Breadcrumb */}
        <div className="hidden sm:flex items-center gap-2 text-sm text-on-surface-variant">
          <span
            className="material-symbols-outlined text-base text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            home
          </span>
          <span className="text-outline">/</span>
          <span className="font-semibold text-on-surface">{pageLabel}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notificaciones */}
        <button
          className="p-1.5 hover:bg-surface-container rounded-lg transition-colors text-on-surface-variant relative"
          aria-label="Notificaciones"
        >
          <span className="material-symbols-outlined text-[22px]">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-tertiary-container rounded-full border-2 border-white animate-pulse-dot" />
        </button>

        <div className="h-7 w-px bg-surface-container hidden sm:block" />

        {/* Usuario */}
        {usuario && (
          <div className="flex items-center gap-2.5 hover:bg-surface-container px-2 py-1.5 rounded-xl transition-colors group cursor-default">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-on-surface leading-none group-hover:text-primary transition-colors">
                {usuario.nombre} {usuario.apellido}
              </p>
              <p className="text-[10px] text-outline font-medium mt-0.5">{usuario.rol}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary-gradient flex items-center justify-center text-white font-bold text-sm shrink-0">
              {usuario.nombre.charAt(0)}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
