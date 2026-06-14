import type { SucursalDb, SucursalDto } from './sucursales.types';
/**
 * Obtiene todas las sucursales del sistema.
 */
export declare function findAllSucursales(soloActivas?: boolean): Promise<SucursalDb[]>;
/**
 * Obtiene una sucursal por su ID.
 */
export declare function findSucursalById(id: number): Promise<SucursalDb | null>;
/**
 * Crea una nueva sucursal en el sistema.
 */
export declare function createSucursal(dto: SucursalDto): Promise<SucursalDb>;
/**
 * Actualiza los datos de una sucursal existente.
 */
export declare function updateSucursal(id: number, dto: SucursalDto): Promise<SucursalDb | null>;
/**
 * Modifica el estado activo/inactivo de una sucursal.
 */
export declare function toggleSucursalEstado(id: number, activa: boolean): Promise<SucursalDb | null>;
//# sourceMappingURL=sucursales.repository.d.ts.map