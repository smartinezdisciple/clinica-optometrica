import type { ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore, useUIStore } from '@/lib/store'
import { toast } from 'sonner'

interface NavItem {
  to: string
  icon: string
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard',          icon: 'dashboard',       label: 'Tablero' },
  { to: '/ventas',             icon: 'point_of_sale',   label: 'Ventas' },
  { to: '/inventario',         icon: 'inventory_2',     label: 'Inventario' },
  { to: '/historias-clinicas', icon: 'clinical_notes',  label: 'Historias Clínicas' },
  { to: '/citas',              icon: 'calendar_month',  label: 'Citas' },
  { to: '/pacientes',          icon: 'groups',          label: 'Pacientes' },
  { to: '/empresas',           icon: 'domain',          label: 'Empresas' },
]

export function BarraLateral() {
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const { clearSession, usuario } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    clearSession()
    toast.success('Sesión cerrada correctamente')
    navigate('/login')
  }

  return (
    <>
      {/* Overlay móvil */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`h-screen w-64 fixed left-0 top-0 z-50 bg-white border-r border-surface-container
          flex flex-col py-5 sidebar-transition
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0`}
        aria-label="Navegación principal"
      >
        {/* Logo */}
        <div className="px-5 mb-7 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-gradient flex items-center justify-center shrink-0 shadow-primary-glow">
              <span
                className="material-symbols-outlined text-white text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                visibility
              </span>
            </div>
            <div>
              <p className="text-base font-extrabold font-headline bg-primary-gradient bg-clip-text text-transparent leading-none">
                Dr. Lentes
              </p>
              <p className="text-[9px] uppercase tracking-[.18em] text-outline font-semibold mt-0.5">
                Ópticas Clínicas
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto" aria-label="Módulos">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mr-1 transition-all duration-200
                ${isActive
                  ? 'bg-white text-primary font-bold shadow-card'
                  : 'text-on-surface-variant hover:bg-primary/5 hover:text-primary'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className="material-symbols-outlined shrink-0 text-[22px]"
                    style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}

          <div className="my-3 h-px bg-surface-container mx-1" />

          <NavLink
            to="/reportes"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mr-1 text-on-surface-variant hover:bg-primary/5 hover:text-primary transition-all"
          >
            <span className="material-symbols-outlined shrink-0 text-[22px]">bar_chart</span>
            <span>Reportes</span>
          </NavLink>
          <NavLink
            to="/caja"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mr-1 text-on-surface-variant hover:bg-primary/5 hover:text-primary transition-all"
          >
            <span className="material-symbols-outlined shrink-0 text-[22px]">account_balance_wallet</span>
            <span>Caja</span>
          </NavLink>

          {usuario?.rol === 'Administrador' && (
            <>
              <div className="my-2 h-px bg-surface-container mx-1" />
              <NavLink
                to="/sucursales"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mr-1 text-on-surface-variant hover:bg-primary/5 hover:text-primary transition-all"
              >
                <span className="material-symbols-outlined shrink-0 text-[22px]">domain</span>
                <span>Sucursales</span>
              </NavLink>
              <NavLink
                to="/usuarios"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mr-1 text-on-surface-variant hover:bg-primary/5 hover:text-primary transition-all"
              >
                <span className="material-symbols-outlined shrink-0 text-[22px]">group</span>
                <span>Usuarios</span>
              </NavLink>
            </>
          )}
        </nav>

        {/* Footer de sesión */}
        <div className="px-3 pt-4 border-t border-surface-container space-y-0.5 shrink-0">
          {usuario && (
            <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
              <div className="w-8 h-8 rounded-full bg-primary-gradient flex items-center justify-center text-white font-bold text-sm shrink-0">
                {usuario.nombre.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-on-surface truncate">
                  {usuario.nombre} {usuario.apellido}
                </p>
                <p className="text-[10px] text-outline truncate">{usuario.rol}</p>
              </div>
            </div>
          )}
          <NavLink
            to="/configuracion"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mr-1 text-on-surface-variant hover:bg-primary/5 hover:text-primary transition-all"
          >
            <span className="material-symbols-outlined shrink-0 text-[22px]">settings</span>
            <span>Configuración</span>
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm mr-1 text-on-surface-variant hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <span className="material-symbols-outlined shrink-0 text-[22px]">logout</span>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  )
}

// Export unused ReactNode to suppress lint warning
export type { ReactNode }
