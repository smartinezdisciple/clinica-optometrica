import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV:        z.enum(['development', 'test', 'production']).default('development'),
  PORT:            z.coerce.number().default(3000),
  FRONTEND_URL:    z.string().default('http://localhost:5173'),

  // PostgreSQL
  DB_HOST:         z.string().default('localhost'),
  DB_PORT:         z.coerce.number().default(5432),
  DB_NAME:         z.string(),
  DB_USER:         z.string(),
  DB_PASSWORD:     z.string(),
  DB_POOL_MIN:     z.coerce.number().default(2),
  DB_POOL_MAX:     z.coerce.number().default(10),
  DB_SSL:          z.coerce.boolean().default(false),

  // JWT
  JWT_ACCESS_SECRET:   z.string().min(32),
  JWT_REFRESH_SECRET:  z.string().min(32),
  JWT_ACCESS_EXPIRES:  z.string().default('15m'),
  JWT_REFRESH_EXPIRES: z.string().default('7d'),

  // SMTP (opcional — para recuperación de contraseña)
  SMTP_HOST:       z.string().optional(),
  SMTP_PORT:       z.coerce.number().optional(),
  SMTP_USER:       z.string().optional(),
  SMTP_PASS:       z.string().optional(),
  SMTP_FROM:       z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌  Variables de entorno inválidas o faltantes:')
  console.error(JSON.stringify(parsed.error.format(), null, 2))
  process.exit(1)
}

export const env = parsed.data
export type Env = typeof env
