import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/lib/store'
import { CargadorIris } from '@/components/ui/CargadorIris'
import { lazy, Suspense } from 'react'
import { PlantillaAutenticada } from '@/components/layout/PlantillaAutenticada'

// ─── Páginas (lazy load para mejor performance) ───────────────────────────────
const PaginaLogin      = lazy(() => import('@/features/autenticacion/pages/PaginaLogin'))
const PaginaRecuperarContrasena = lazy(() => import('@/features/autenticacion/pages/PaginaRecuperarContrasena'))
const PaginaRestablecerContrasena = lazy(() => import('@/features/autenticacion/pages/PaginaRestablecerContrasena'))
const PaginaDashboard  = lazy(() => import('@/features/dashboard/pages/PaginaDashboard'))
const PaginaVentas     = lazy(() => import('@/features/ventas/pages/PaginaVentas'))
const PaginaCitas      = lazy(() => import('@/features/citas/pages/PaginaCitas'))
const PaginaInventario = lazy(() => import('@/features/inventario/pages/PaginaInventario'))
const PaginaExpedientes = lazy(() => import('@/features/expedientes/pages/PaginaExpedientes'))
const PaginaSucursales  = lazy(() => import('@/features/sucursales/pages/PaginaSucursales'))
const PaginaUsuarios    = lazy(() => import('@/features/usuarios/pages/PaginaUsuarios'))
const PaginaPacientes   = lazy(() => import('@/features/pacientes/pages/PaginaPacientes'))
const PaginaEmpresas    = lazy(() => import('@/features/pacientes/pages/PaginaEmpresas'))
const PaginaNoEncontrada = lazy(() => import('@/features/common/pages/PaginaNoEncontrada'))

// ─── Guard de autenticación ───────────────────────────────────────────────────
function RutaProtegida() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return (
    <PlantillaAutenticada>
      <Outlet />
    </PlantillaAutenticada>
  )
}

function RutaPublica() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

// ─── Fallback de carga ────────────────────────────────────────────────────────
function LoadingFallback() {
  return (
    <div className="h-screen flex items-center justify-center bg-surface">
      <CargadorIris />
    </div>
  )
}

// ─── Router principal ─────────────────────────────────────────────────────────
export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Redirigir raíz */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Rutas públicas */}
          <Route element={<RutaPublica />}>
            <Route path="/login" element={<PaginaLogin />} />
            <Route path="/recuperar-contrasena" element={<PaginaRecuperarContrasena />} />
            <Route path="/restablecer-contrasena" element={<PaginaRestablecerContrasena />} />
          </Route>

          {/* Rutas protegidas */}
          <Route element={<RutaProtegida />}>
            <Route path="/dashboard"           element={<PaginaDashboard />} />
            <Route path="/ventas"              element={<PaginaVentas />} />
            <Route path="/citas"               element={<PaginaCitas />} />
            <Route path="/inventario"          element={<PaginaInventario />} />
            <Route path="/historias-clinicas"  element={<PaginaExpedientes />} />
            <Route path="/sucursales"          element={<PaginaSucursales />} />
            <Route path="/usuarios"            element={<PaginaUsuarios />} />
            <Route path="/pacientes"           element={<PaginaPacientes />} />
            <Route path="/empresas"            element={<PaginaEmpresas />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<PaginaNoEncontrada />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
