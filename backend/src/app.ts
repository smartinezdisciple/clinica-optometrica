import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { rateLimit } from 'express-rate-limit'
import { env } from './config/env'
import { manejoErrores } from './middleware/manejo-errores'
import { autenticacionRouter } from './modules/autenticacion/autenticacion.routes'
import { sucursalesRouter } from './modules/sucursales/sucursales.routes'
import { usuariosRouter, empleadosRouter } from './modules/usuarios/usuarios.routes'
import { pacientesRouter } from './modules/pacientes/pacientes.routes'
import { empresasRouter } from './modules/empresas/empresas.routes'
import { citasRouter } from './modules/citas/citas.routes'

const app = express()

// ── Seguridad ─────────────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,               // Necesario para cookies del refresh token
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}))

// ── Rate Limiting ─────────────────────────────────────────────────────────────
app.use('/api/auth/login', rateLimit({
  windowMs: 15 * 60 * 1000,       // 15 minutos
  max: 20,                         // 20 intentos máximo
  message: { ok: false, error: 'Demasiados intentos. Espera 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
}))

app.use(rateLimit({
  windowMs: 60 * 1000,             // 1 minuto
  max: 200,
  message: { ok: false, error: 'Demasiadas peticiones. Intenta de nuevo.' },
  standardHeaders: true,
  legacyHeaders: false,
}))

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

// ── Logger ────────────────────────────────────────────────────────────────────
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'))
}

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ ok: true, status: 'running', version: '1.0.0', env: env.NODE_ENV })
})

// ── Rutas de la API ───────────────────────────────────────────────────────────
app.use('/api/auth', autenticacionRouter)
app.use('/api/sucursales', sucursalesRouter)
app.use('/api/usuarios', usuariosRouter)
app.use('/api/empleados', empleadosRouter)
app.use('/api/pacientes', pacientesRouter)
app.use('/api/empresas', empresasRouter)
app.use('/api/citas', citasRouter)
// TODO: Agregar más routers por módulo:
// app.use('/api/ventas',    ventasRouter)
// app.use('/api/inventario', inventarioRouter)

// ── Manejo centralizado de errores ────────────────────────────────────────────
app.use(manejoErrores)

// ── 404 catch-all ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ ok: false, error: 'Ruta no encontrada' })
})

// ── Start ─────────────────────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(env.PORT, () => {
    console.log(`✅  Backend corriendo en http://localhost:${env.PORT}`)
    console.log(`   Entorno: ${env.NODE_ENV}`)
    console.log(`   Frontend: ${env.FRONTEND_URL}`)
  })
}

export default app
