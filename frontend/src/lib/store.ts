import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Tipos ───────────────────────────────────────────────────────────────────
export interface UsuarioSesion {
  id: number
  nombre: string
  apellido: string
  email: string
  rol: string
  permisos: string[]
  sucursalId: number
}

interface EstadoAuth {
  usuario: UsuarioSesion | null
  accessToken: string | null
  isAuthenticated: boolean
}

interface AccionesAuth {
  setUsuario: (usuario: UsuarioSesion, token: string) => void
  clearSession: () => void
  updateToken: (token: string) => void
}

interface EstadoUI {
  sidebarOpen: boolean
  tema: 'light' | 'dark'
}

interface AccionesUI {
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  setTema: (tema: 'light' | 'dark') => void
}

// ─── Store de Autenticación ───────────────────────────────────────────────────
export const useAuthStore = create<EstadoAuth & AccionesAuth>()(
  persist(
    (set) => ({
      usuario: null,
      accessToken: null,
      isAuthenticated: false,

      setUsuario: (usuario, accessToken) =>
        set({ usuario, accessToken, isAuthenticated: true }),

      clearSession: () =>
        set({ usuario: null, accessToken: null, isAuthenticated: false }),

      updateToken: (accessToken) =>
        set({ accessToken }),
    }),
    {
      name: 'auth-session',
      // Solo persiste usuario (el token no se guarda en localStorage — solo en memoria)
      partialize: (state) => ({ usuario: state.usuario, isAuthenticated: state.isAuthenticated }),
    },
  ),
)

// ─── Store de UI ──────────────────────────────────────────────────────────────
export const useUIStore = create<EstadoUI & AccionesUI>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      tema: 'light',

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTema: (tema) => set({ tema }),
    }),
    { name: 'ui-prefs' },
  ),
)
