import { Pool, type PoolClient, type QueryResultRow } from 'pg';
export declare const pool: Pool;
/**
 * Ejecuta una query usando un cliente del pool.
 * @template T Tipo del resultado esperado
 */
export declare function query<T extends QueryResultRow = any>(sql: string, params?: unknown[]): Promise<import("pg").QueryResult<T>>;
/**
 * Ejecuta una transacción completa.
 * Si el callback lanza un error, hace ROLLBACK automático.
 */
export declare function withTransaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T>;
//# sourceMappingURL=database.d.ts.map