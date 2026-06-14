"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.query = query;
exports.withTransaction = withTransaction;
const pg_1 = require("pg");
const env_1 = require("./env");
exports.pool = new pg_1.Pool({
    host: env_1.env.DB_HOST,
    port: env_1.env.DB_PORT,
    database: env_1.env.DB_NAME,
    user: env_1.env.DB_USER,
    password: env_1.env.DB_PASSWORD,
    min: env_1.env.DB_POOL_MIN,
    max: env_1.env.DB_POOL_MAX,
    ssl: env_1.env.DB_SSL ? { rejectUnauthorized: false } : false,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
});
exports.pool.on('error', (err) => {
    console.error('❌  Error inesperado en pool de PostgreSQL:', err.message);
});
/**
 * Ejecuta una query usando un cliente del pool.
 * @template T Tipo del resultado esperado
 */
async function query(sql, params) {
    const client = await exports.pool.connect();
    try {
        const result = await client.query(sql, params);
        return result;
    }
    finally {
        client.release();
    }
}
/**
 * Ejecuta una transacción completa.
 * Si el callback lanza un error, hace ROLLBACK automático.
 */
async function withTransaction(callback) {
    const client = await exports.pool.connect();
    try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
    }
    catch (err) {
        await client.query('ROLLBACK');
        throw err;
    }
    finally {
        client.release();
    }
}
//# sourceMappingURL=database.js.map