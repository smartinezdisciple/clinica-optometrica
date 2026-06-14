import { z } from 'zod';
export interface EmpresaDb {
    id_cliente: number;
    cedula: string | null;
    primer_nombre: string;
    segundo_nombre: string | null;
    primer_apellido: string;
    segundo_apellido: string | null;
    tipo_cliente: 'Persona' | 'Empresa';
    numero_telefono: string;
    correo: string | null;
    fecha_registro: Date;
    razon_social: string;
    ruc: string;
}
export declare const EmpresaSchema: z.ZodObject<{
    cedula: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    primer_nombre: z.ZodString;
    segundo_nombre: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    primer_apellido: z.ZodString;
    segundo_apellido: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    numero_telefono: z.ZodString;
    correo: z.ZodEffects<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>, string | undefined, string | undefined>;
    razon_social: z.ZodString;
    ruc: z.ZodString;
}, "strip", z.ZodTypeAny, {
    primer_nombre: string;
    primer_apellido: string;
    numero_telefono: string;
    razon_social: string;
    ruc: string;
    correo?: string | undefined;
    segundo_nombre?: string | undefined;
    segundo_apellido?: string | undefined;
    cedula?: string | undefined;
}, {
    primer_nombre: string;
    primer_apellido: string;
    numero_telefono: string;
    razon_social: string;
    ruc: string;
    correo?: string | undefined;
    segundo_nombre?: string | undefined;
    segundo_apellido?: string | undefined;
    cedula?: string | undefined;
}>;
export type CrearEmpresaDto = z.infer<typeof EmpresaSchema>;
export type ActualizarEmpresaDto = Partial<CrearEmpresaDto>;
//# sourceMappingURL=empresas.types.d.ts.map