import { z } from 'zod';
export declare const CrearUsuarioSchema: z.ZodObject<{
    nombres: z.ZodString;
    apellidos: z.ZodString;
    numero_telefono: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    correo: z.ZodUnion<[z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodLiteral<"">]>;
    id_sucursal: z.ZodNumber;
    nombre_usuario: z.ZodString;
    contrasena: z.ZodString;
    id_rol: z.ZodNumber;
}, z.core.$strip>;
export declare const ActualizarUsuarioSchema: z.ZodObject<{
    nombres: z.ZodOptional<z.ZodString>;
    apellidos: z.ZodOptional<z.ZodString>;
    numero_telefono: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    correo: z.ZodUnion<[z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodLiteral<"">]>;
    id_sucursal: z.ZodOptional<z.ZodNumber>;
    nombre_usuario: z.ZodOptional<z.ZodString>;
    contrasena: z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>;
    id_rol: z.ZodOptional<z.ZodNumber>;
    activo: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
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
    nombres: string;
    apellidos: string;
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
    nombres: string;
    apellidos: string;
    numero_telefono: string | null;
    correo: string | null;
    id_sucursal: number | null;
    nombre_sucursal?: string;
}
//# sourceMappingURL=usuarios.types.d.ts.map