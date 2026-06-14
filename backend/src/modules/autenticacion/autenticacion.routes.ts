import { Router } from 'express'
import { login, logout, refresh, verificar, recuperarContrasena, restablecerContrasena } from './autenticacion.controller'
import { autenticar } from '../../middleware/autenticacion'

export const autenticacionRouter = Router()

// POST /api/auth/login — Pública
autenticacionRouter.post('/login', login)

// POST /api/auth/logout — Requiere JWT
autenticacionRouter.post('/logout', autenticar, logout)

// POST /api/auth/refresh — Pública (usa cookie)
autenticacionRouter.post('/refresh', refresh)

// GET /api/auth/verificar — Requiere JWT
autenticacionRouter.get('/verificar', autenticar, verificar)

// POST /api/auth/recuperar-contrasena — Pública
autenticacionRouter.post('/recuperar-contrasena', recuperarContrasena)

// POST /api/auth/restablecer-contrasena — Pública
autenticacionRouter.post('/restablecer-contrasena', restablecerContrasena)
