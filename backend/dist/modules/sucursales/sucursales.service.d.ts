import type { SucursalDb, SucursalDto } from './sucursales.types';
/**
 * Servicio para listar todas las sucursales.
 */
export declare function getSucursalesList(soloActivas?: boolean): Promise<SucursalDb[]>;
/**
 * Servicio para obtener una sucursal por ID.
 */
export declare function getSucursal(id: number): Promise<SucursalDb>;
/**
 * Servicio para crear una sucursal.
 */
export declare function registerSucursal(dto: SucursalDto): Promise<SucursalDb>;
/**
 * Servicio para actualizar una sucursal existente.
 */
export declare function modifySucursal(id: number, dto: SucursalDto): Promise<SucursalDb>;
/**
 * Servicio para cambiar el estado activo de la sucursal.
 */
export declare function changeSucursalStatus(id: number, activa: boolean): Promise<SucursalDb>;
//# sourceMappingURL=sucursales.service.d.ts.map