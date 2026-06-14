import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { CargadorIris } from '@/components/ui/CargadorIris'
import { api } from '@/lib/api'
import type { ApiResponse } from '@/lib/api'

export default function PaginaRestablecerContrasena() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [completado, setCompletado] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!token) {
      setError('Token de recuperación no válido o inexistente.')
      return
    }

    if (!password || !confirmPassword) {
      setError('Por favor completa todos los campos.')
      return
    }

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setLoading(true)
    try {
      await api.post<ApiResponse<void>>('/auth/restablecer-contrasena', {
        token,
        contrasena: password,
      })
      setCompletado(true)
      toast.success('Contraseña restablecida con éxito.')
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'body' in err) {
        const apiErr = err as { body: { error: string } }
        setError(apiErr.body.error)
      } else {
        setError('Error de conexión o token expirado. Intenta solicitar un nuevo enlace.')
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

          {!completado ? (
            <>
              <h2 className="text-lg font-bold text-on-surface mb-1">Nueva Contraseña</h2>
              <p className="text-sm text-outline mb-6">Ingresa tu nueva contraseña para acceder al sistema.</p>

              {!token && (
                <div className="mb-4 flex items-center gap-2 bg-danger-container text-danger rounded-xl px-3 py-2.5 text-sm">
                  <span className="material-symbols-outlined text-base shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
                    error
                  </span>
                  Falta el token de recuperación en la URL. Solicita un nuevo enlace.
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Password */}
                <div>
                  <label htmlFor="reset-password" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Nueva Contraseña (mín. 8 caracteres)
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                      lock
                    </span>
                    <input
                      id="reset-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-surface-container-low border-none rounded-xl py-3 pl-10 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                      disabled={loading || !token}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      disabled={!token}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="reset-confirm-password" className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                      lock_reset
                    </span>
                    <input
                      id="reset-confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-surface-container-low border-none rounded-xl py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                      disabled={loading || !token}
                    />
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
                  disabled={loading || !token}
                  className="w-full py-3 rounded-xl bg-primary-gradient text-white font-bold text-sm shadow-primary-glow
                    hover:shadow-float hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200
                    disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
                    flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <CargadorIris size={20} />
                      <span>Restableciendo…</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">
                        published_with_changes
                      </span>
                      Restablecer Contraseña
                    </>
                  )}
                </button>

                {/* Regresar */}
                <p className="text-center text-xs text-outline pt-2">
                  <button
                    type="button"
                    className="text-primary font-bold hover:underline flex items-center justify-center gap-1 mx-auto"
                    onClick={() => navigate('/login')}
                    disabled={loading}
                  >
                    <span className="material-symbols-outlined text-sm">
                      arrow_back
                    </span>
                    Volver al inicio de sesión
                  </button>
                </p>
              </form>
            </>
          ) : (
            <div className="text-center animate-fade-in">
              <span className="material-symbols-outlined text-success text-5xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              <h2 className="text-lg font-bold text-on-surface mb-2">Restablecido con Éxito</h2>
              <p className="text-sm text-outline mb-6">
                Tu contraseña ha sido actualizada. Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-3 rounded-xl bg-primary-gradient text-white font-bold text-sm shadow-primary-glow hover:shadow-float hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">
                  login
                </span>
                Iniciar Sesión
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-outline mt-6">
          Dr. Lentes Sistema v1.2 · © {new Date().getFullYear()} Clínica Optométrica
        </p>
      </div>
    </div>
  )
}
