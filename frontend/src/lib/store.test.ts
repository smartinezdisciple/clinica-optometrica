import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore, useUIStore, type UsuarioSesion } from './store'

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    useAuthStore.getState().clearSession()
  })

  it('debería iniciar con estado inicial vacío', () => {
    const state = useAuthStore.getState()
    expect(state.usuario).toBeNull()
    expect(state.accessToken).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('debería establecer el usuario y el token de acceso', () => {
    const mockUser: UsuarioSesion = {
      id: 1,
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@perez.com',
      rol: 'Administrador',
      permisos: ['ver_usuarios', 'crear_usuarios'],
      sucursalId: 1,
    }
    const mockToken = 'mock-access-token'

    useAuthStore.getState().setUsuario(mockUser, mockToken)

    const state = useAuthStore.getState()
    expect(state.usuario).toEqual(mockUser)
    expect(state.accessToken).toBe(mockToken)
    expect(state.isAuthenticated).toBe(true)
  })

  it('debería limpiar la sesión', () => {
    const mockUser: UsuarioSesion = {
      id: 1,
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@perez.com',
      rol: 'Administrador',
      permisos: [],
      sucursalId: 1,
    }
    useAuthStore.getState().setUsuario(mockUser, 'token')
    useAuthStore.getState().clearSession()

    const state = useAuthStore.getState()
    expect(state.usuario).toBeNull()
    expect(state.accessToken).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('debería actualizar el token de acceso', () => {
    useAuthStore.getState().updateToken('new-token')
    expect(useAuthStore.getState().accessToken).toBe('new-token')
  })
})

describe('useUIStore', () => {
  beforeEach(() => {
    // Reset to default states
    useUIStore.setState({ sidebarOpen: true, tema: 'light' })
  })

  it('debería alternar el sidebar', () => {
    expect(useUIStore.getState().sidebarOpen).toBe(true)
    useUIStore.getState().toggleSidebar()
    expect(useUIStore.getState().sidebarOpen).toBe(false)
    useUIStore.getState().toggleSidebar()
    expect(useUIStore.getState().sidebarOpen).toBe(true)
  })

  it('debería establecer el estado del sidebar explícitamente', () => {
    useUIStore.getState().setSidebarOpen(false)
    expect(useUIStore.getState().sidebarOpen).toBe(false)
    useUIStore.getState().setSidebarOpen(true)
    expect(useUIStore.getState().sidebarOpen).toBe(true)
  })

  it('debería establecer el tema', () => {
    expect(useUIStore.getState().tema).toBe('light')
    useUIStore.getState().setTema('dark')
    expect(useUIStore.getState().tema).toBe('dark')
  })
})
