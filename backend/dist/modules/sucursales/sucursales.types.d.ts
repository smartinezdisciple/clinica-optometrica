import { z } from 'zod';
export declare const SucursalSchema: z.ZodObject<{
    nombre: z.ZodString;
    direccion: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    telefono: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    correo: z.ZodUnion<[z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodLiteral<"">]>;
}, z.core.$strip>;
export type SucursalDto = z.infer<typeof SucursalSchema>;
export interface SucursalDb {
    id_sucursal: number;
    nombre: string;
    direccion: string | null;
    telefono: string | null;
    correo: string | null;
    activa: boolean;
}
//# sourceMappingURL=sucursales.types.d.ts.map