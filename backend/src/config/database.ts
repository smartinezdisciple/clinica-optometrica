import { Pool, type PoolClient, type QueryResultRow } from 'pg'
import { env } from './env'

export const pool = new Pool({
  host:     env.DB_HOST,
  port:     env.DB_PORT,
  database: env.DB_NAME,
  user:     env.DB_USER,
  password: env.DB_PASSWORD,
  min:      env.DB_POOL_MIN,
  max:      env.DB_POOL_MAX,
  ssl:      env.DB_SSL ? { rejectUnauthorized: false } : false,
  idleTimeoutMillis:    30_000,
  connectionTimeoutMillis: 5_000,
})

pool.on('error', (err) => {
  console.error('❌  Error inesperado en pool de PostgreSQL:', err.message)
})

/**
 * Ejecuta una query usando un cliente del pool.
 * @template T Tipo del resultado esperado
 */
export async function query<T extends QueryResultRow = any>(
  sql: string,
  params?: unknown[],
) {
  const client = await pool.connect()
  try {
    const result = await client.query<T>(sql, params)
    return result
  } finally {
    client.release()
  }
}

/**
 * Ejecuta una transacción completa.
 * Si el callback lanza un error, hace ROLLBACK automático.
 */
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
