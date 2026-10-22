import { z } from 'zod';
export interface EmpresaDb {
    id_cliente: number;
    cedula: string | null;
    nombres: string;
    apellidos: string;
    tipo_cliente: 'Persona' | 'Empresa';
    numero_telefono: string;
    correo: string | null;
    fecha_registro: Date;
    razon_social: string;
    ruc: string;
}
export declare const EmpresaSchema: z.ZodObject<{
    cedula: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
    nombres: z.ZodString;
    apellidos: z.ZodString;
    numero_telefono: z.ZodString;
    correo: z.ZodPipe<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>, z.ZodTransform<string | undefined, string | undefined>>;
    razon_social: z.ZodString;
    ruc: z.ZodString;
}, z.core.$strip>;
export type CrearEmpresaDto = z.infer<typeof EmpresaSchema>;
export type ActualizarEmpresaDto = Partial<CrearEmpresaDto>;
//# sourceMappingURL=empresas.types.d.ts.map