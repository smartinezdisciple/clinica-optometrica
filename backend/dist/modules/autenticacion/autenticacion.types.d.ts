import { z } from 'zod';
export declare const LoginSchema: z.ZodObject<{
    email: z.ZodString;
    contrasena: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
    contrasena: string;
}, {
    email: string;
    contrasena: string;
}>;
export declare const RecuperarSchema: z.ZodObject<{
    email: z.ZodString;
}, "strip", z.ZodTypeAny, {
    email: string;
}, {
    email: string;
}>;
export declare const RestablecerSchema: z.ZodObject<{
    token: z.ZodString;
    contrasena: z.ZodString;
}, "strip", z.ZodTypeAny, {
    contrasena: string;
    token: string;
}, {
    contrasena: string;
    token: string;
}>;
export type LoginDto = z.infer<typeof LoginSchema>;
export type RecuperarDto = z.infer<typeof RecuperarSchema>;
export type RestablecerDto = z.infer<typeof RestablecerSchema>;
export interface UsuarioDb {
    id_usuario: number;
    id_empleado: number;
    email: string;
    contrasena_hash: string;
    activo: boolean;
    bloqueado: boolean;
    id_rol: number;
    nombre_rol: string;
    id_sucursal: number;
    nombre: string;
    apellido: string;
}
export interface SesionUsuario {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    rol: string;
    permisos: string[];
    sucursalId: number;
}
//# sourceMappingURL=autenticacion.types.d.ts.map