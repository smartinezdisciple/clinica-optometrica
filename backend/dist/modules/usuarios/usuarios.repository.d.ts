import type { UsuarioDetalleDb, CrearUsuarioDto, ActualizarUsuarioDto, RolDb, PermisoDb, EmpleadoDb } from './usuarios.types';
/**
 * Obtiene todos los usuarios del sistema.
 */
export declare function findAllUsuarios(): Promise<UsuarioDetalleDb[]>;
/**
 * Obtiene un usuario detallado por su ID.
 */
export declare function findUsuarioDetalleById(id: number): Promise<UsuarioDetalleDb | null>;
/**
 * Busca un usuario por nombre de usuario.
 */
export declare function findUsuarioByNombreUsuario(nombreUsuario: string): Promise<{
    id_usuario: number;
} | null>;
/**
 * Obtiene todos los roles.
 */
export declare function findRoles(): Promise<RolDb[]>;
/**
 * Obtiene todos los permisos.
 */
export declare function findPermisos(): Promise<PermisoDb[]>;
/**
 * Obtiene los permisos asociados a un rol específico.
 */
export declare function findPermisosByRolId(rolId: number): Promise<number[]>;
/**
 * Obtiene todos los empleados.
 */
export declare function findEmpleados(): Promise<EmpleadoDb[]>;
/**
 * Inserta un empleado y un usuario correspondiente en una sola transacción.
 */
export declare function insertUsuarioYEmpleadoTransaccion(dto: CrearUsuarioDto, contrasenaHash: string): Promise<number>;
/**
 * Actualiza los datos de un usuario y de su empleado correspondiente en una sola transacción.
 */
export declare function updateUsuarioYEmpleadoTransaccion(idUsuario: number, idEmpleado: number, dto: ActualizarUsuarioDto, contrasenaHash?: string): Promise<void>;
/**
 * Modifica el estado activo/inactivo de un usuario.
 */
export declare function toggleUsuarioEstado(id: number, activo: boolean): Promise<void>;
/**
 * Desbloquea un usuario bloqueado por múltiples intentos de login.
 */
export declare function desbloquearUsuarioRepo(id: number): Promise<void>;
/**
 * Actualiza los permisos asociados a un rol.
 */
export declare function updateRolPermisos(rolId: number, permisosIds: number[]): Promise<void>;
//# sourceMappingURL=usuarios.repository.d.ts.map