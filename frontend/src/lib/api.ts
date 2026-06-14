import { useAuthStore } from '@/lib/store'

// ─── Tipos de respuesta ───────────────────────────────────────────────────────
export interface ApiResponse<T> {
  ok: true
  data: T
  mensaje?: string
}

export interface ApiListResponse<T> {
  ok: true
  data: T[]
  total: number
  pagina: number
  limite: number
}

export interface ApiError {
  ok: false
  error: string
  detalles?: Record<string, string[]>
}

export class ApiHttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiError,
  ) {
    super(body.error)
    this.name = 'ApiHttpError'
  }
}

// ─── Configuración ────────────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'

// ─── Cliente HTTP ─────────────────────────────────────────────────────────────
async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const { accessToken } = useAuthStore.getState()

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  }

  if (accessToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${accessToken}`
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Para la cookie del refresh token
  })

  // Si el access token expiró, intentar renovar
  if (response.status === 401) {
    const refreshed = await tryRefreshToken()
    if (refreshed) {
      // Reintentar la petición original con el nuevo token
      const { accessToken: newToken } = useAuthStore.getState()
      ;(headers as Record<string, string>)['Authorization'] = `Bearer ${newToken}`
      const retryResponse = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',
      })
      if (!retryResponse.ok) {
        const errorBody = await retryResponse.json() as ApiError
        throw new ApiHttpError(retryResponse.status, errorBody)
      }
      return retryResponse.json() as Promise<T>
    } else {
      // Limpiar sesión y redirigir al login
      useAuthStore.getState().clearSession()
      window.location.href = '/login'
      throw new ApiHttpError(401, { ok: false, error: 'Sesión expirada' })
    }
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({
      ok: false as const,
      error: 'Error desconocido del servidor',
    })) as ApiError
    throw new ApiHttpError(response.status, errorBody)
  }

  return response.json() as Promise<T>
}

// ─── Renovación de token ──────────────────────────────────────────────────────
async function tryRefreshToken(): Promise<boolean> {
  try {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
    if (!response.ok) return false
    const { data } = await response.json() as ApiResponse<{ accessToken: string }>
    useAuthStore.getState().updateToken(data.accessToken)
    return true
  } catch {
    return false
  }
}

// ─── Métodos de conveniencia ──────────────────────────────────────────────────
export const api = {
  get: <T>(url: string) =>
    request<T>(url, { method: 'GET' }),

  post: <T>(url: string, body: unknown) =>
    request<T>(url, { method: 'POST', body: JSON.stringify(body) }),

  put: <T>(url: string, body: unknown) =>
    request<T>(url, { method: 'PUT', body: JSON.stringify(body) }),

  patch: <T>(url: string, body: unknown) =>
    request<T>(url, { method: 'PATCH', body: JSON.stringify(body) }),

  delete: <T>(url: string) =>
    request<T>(url, { method: 'DELETE' }),
}
