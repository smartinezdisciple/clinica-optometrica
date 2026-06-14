import { z } from 'zod';
export declare const CrearUsuarioSchema: z.ZodObject<{
    primer_nombre: z.ZodString;
    segundo_nombre: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    primer_apellido: z.ZodString;
    segundo_apellido: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    numero_telefono: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    correo: z.ZodUnion<[z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodLiteral<"">]>;
    id_sucursal: z.ZodNumber;
    nombre_usuario: z.ZodString;
    contrasena: z.ZodString;
    id_rol: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    contrasena: string;
    primer_nombre: string;
    primer_apellido: string;
    id_sucursal: number;
    nombre_usuario: string;
    id_rol: number;
    correo?: string | null | undefined;
    segundo_nombre?: string | null | undefined;
    segundo_apellido?: string | null | undefined;
    numero_telefono?: string | null | undefined;
}, {
    contrasena: string;
    primer_nombre: string;
    primer_apellido: string;
    id_sucursal: number;
    nombre_usuario: string;
    id_rol: number;
    correo?: string | null | undefined;
    segundo_nombre?: string | null | undefined;
    segundo_apellido?: string | null | undefined;
    numero_telefono?: string | null | undefined;
}>;
export declare const ActualizarUsuarioSchema: z.ZodObject<{
    primer_nombre: z.ZodOptional<z.ZodString>;
    segundo_nombre: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    primer_apellido: z.ZodOptional<z.ZodString>;
    segundo_apellido: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    numero_telefono: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    correo: z.ZodUnion<[z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodLiteral<"">]>;
    id_sucursal: z.ZodOptional<z.ZodNumber>;
    nombre_usuario: z.ZodOptional<z.ZodString>;
    contrasena: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    id_rol: z.ZodOptional<z.ZodNumber>;
    activo: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    contrasena?: string | undefined;
    activo?: boolean | undefined;
    correo?: string | null | undefined;
    primer_nombre?: string | undefined;
    segundo_nombre?: string | null | undefined;
    primer_apellido?: string | undefined;
    segundo_apellido?: string | null | undefined;
    numero_telefono?: string | null | undefined;
    id_sucursal?: number | undefined;
    nombre_usuario?: string | undefined;
    id_rol?: number | undefined;
}, {
    contrasena?: string | undefined;
    activo?: boolean | undefined;
    correo?: string | null | undefined;
    primer_nombre?: string | undefined;
    segundo_nombre?: string | null | undefined;
    primer_apellido?: string | undefined;
    segundo_apellido?: string | null | undefined;
    numero_telefono?: string | null | undefined;
    id_sucursal?: number | undefined;
    nombre_usuario?: string | undefined;
    id_rol?: number | undefined;
}>;
export type CrearUsuarioDto = z.infer<typeof CrearUsuarioSchema>;
export type ActualizarUsuarioDto = z.infer<typeof ActualizarUsuarioSchema>;
export interface RolDb {
    id_rol: number;
    nombre_rol: string;
    descripcion: string | null;
}
export interface PermisoDb {
    id_permiso: number;
    nombre_permiso: string;
    modulo: string;
    descripcion: string | null;
}
export interface EmpleadoDb {
    id_empleado: number;
    primer_nombre: string;
    segundo_nombre: string | null;
    primer_apellido: string;
    segundo_apellido: string | null;
    numero_telefono: string | null;
    correo: string | null;
    id_sucursal: number | null;
    nombre_sucursal?: string;
    activo: boolean;
}
export interface UsuarioDetalleDb {
    id_usuario: number;
    nombre_usuario: string;
    activo: boolean;
    bloqueado: boolean;
    fecha_bloqueo: Date | null;
    fecha_creacion: Date;
    ultimo_acceso: Date | null;
    id_rol: number;
    nombre_rol: string;
    id_empleado: number;
    primer_nombre: string;
    segundo_nombre: string | null;
    primer_apellido: string;
    segundo_apellido: string | null;
    numero_telefono: string | null;
    correo: string | null;
    id_sucursal: number | null;
    nombre_sucursal?: string;
}
//# sourceMappingURL=usuarios.types.d.ts.map