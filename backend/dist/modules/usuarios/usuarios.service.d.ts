import type { UsuarioDetalleDb, CrearUsuarioDto, ActualizarUsuarioDto, RolDb, PermisoDb, EmpleadoDb } from './usuarios.types';
/**
 * Obtiene el listado de todos los usuarios.
 */
export declare function getUsuariosList(): Promise<UsuarioDetalleDb[]>;
/**
 * Obtiene el detalle de un usuario por su ID.
 */
export declare function getUsuario(id: number): Promise<UsuarioDetalleDb>;
/**
 * Registra un nuevo empleado y su respectivo usuario.
 */
export declare function registerUsuario(dto: CrearUsuarioDto): Promise<UsuarioDetalleDb>;
/**
 * Actualiza los datos de un usuario y de su empleado.
 */
export declare function modifyUsuario(id: number, dto: ActualizarUsuarioDto): Promise<UsuarioDetalleDb>;
/**
 * Habilita/Inhabilita un usuario (baja lógica).
 */
export declare function changeUsuarioStatus(id: number, activo: boolean): Promise<void>;
/**
 * Desbloquea un usuario.
 */
export declare function unlockUsuario(id: number): Promise<void>;
/**
 * Obtiene todos los roles disponibles.
 */
export declare function getRolesList(): Promise<RolDb[]>;
/**
 * Obtiene todos los permisos disponibles.
 */
export declare function getPermisosList(): Promise<PermisoDb[]>;
/**
 * Obtiene los IDs de los permisos asignados a un rol.
 */
export declare function getRolPermisos(rolId: number): Promise<number[]>;
/**
 * Asigna una nueva lista de permisos a un rol.
 */
export declare function assignRolPermisos(rolId: number, permisosIds: number[]): Promise<void>;
/**
 * Obtiene el listado de todos los empleados.
 */
export declare function getEmpleadosList(): Promise<EmpleadoDb[]>;
//# sourceMappingURL=usuarios.service.d.ts.map