import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { CargadorIris } from '@/components/ui/CargadorIris'
import { useAuthStore } from '@/lib/store'
import { api } from '@/lib/api'
import type { ApiResponse } from '@/lib/api'

interface LoginResponse {
  usuario: {
    id: number
    nombre: string
    apellido: string
    email: string
    rol: string
    permisos: string[]
    sucursalId: number
  }
  accessToken: string
}

export default function PaginaLogin() {
  const navigate = useNavigate()
  const setUsuario = useAuthStore((s) => s.setUsuario)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Por favor ingresa tu correo y contraseña.')
      return
    }

    setLoading(true)
    try {
      const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', { email, contrasena: password })
      const { usuario, accessToken } = response.data
      setUsuario(usuario, accessToken)
      toast.success(`¡Bienvenido, ${usuario.nombre}!`)
      navigate('/dashboard')
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'body' in err) {
        const apiErr = err as { body: { error: string } }
        setError(apiErr.body.error)
      } else {
        setError('Error de conexión. Verifica tu red e intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-primary/5" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-primary-container/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/3" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-up">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-float border border-surface-container p-8">

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary-gradient flex items-center justify-center shadow-primary-glow mb-4">
              <span
                className="material-symbols-outlined text-white text-3xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                visibility
              </span>
            </div>
            <h1 className="text-2xl font-extrabold font-headline bg-primary-gradient bg-clip-text text-transparent">
              Dr. Lentes
            </h1>
            <p className="text-xs text-outline tracking-widest uppercase font-semibold mt-1">
              Ópticas Clínicas
            </p>
          </div>

          <h2 className="text-lg font-bold text-on-surface mb-1">Iniciar Sesión</h2>
          <p className="text-sm text-outline mb-6">Accede al sistema de gestión</p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  email
                </span>
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  placeholder="usuario@drlentes.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  lock
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-xl py-3 pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-danger-container text-danger rounded-xl px-3 py-2.5 text-sm animate-fade-in">
                <span className="material-symbols-outlined text-base shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                  error
                </span>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary-gradient text-white font-bold text-sm shadow-primary-glow
                hover:shadow-float hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200
                disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
                flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <CargadorIris size={20} />
                  <span>Verificando…</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>
                    login
                  </span>
                  Ingresar al Sistema
                </>
              )}
            </button>

            {/* Recuperar */}
            <p className="text-center text-xs text-outline">
              ¿Olvidaste tu contraseña?{' '}
              <button
                type="button"
                className="text-primary font-bold hover:underline"
                onClick={() => navigate('/recuperar-contrasena')}
              >
                Recuperar acceso
              </button>
            </p>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-outline mt-6">
          Dr. Lentes Sistema v1.2 · © {new Date().getFullYear()} Clínica Optométrica
        </p>
      </div>
    </div>
  )
}
