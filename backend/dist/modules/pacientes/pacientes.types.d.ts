import { z } from 'zod';
export interface ClienteDb {
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
}
export interface PacienteDb extends ClienteDb {
    ocupacion: string | null;
    fecha_nacimiento: Date | string;
    genero: 'Masculino' | 'Femenino' | 'Otro' | null;
}
export declare const PacienteSchema: z.ZodObject<{
    cedula: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    primer_nombre: z.ZodString;
    segundo_nombre: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    primer_apellido: z.ZodString;
    segundo_apellido: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    numero_telefono: z.ZodString;
    correo: z.ZodEffects<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>, string | undefined, string | undefined>;
    ocupacion: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    fecha_nacimiento: z.ZodEffects<z.ZodString, string, string>;
    genero: z.ZodOptional<z.ZodEnum<["Masculino", "Femenino", "Otro"]>>;
}, "strip", z.ZodTypeAny, {
    primer_nombre: string;
    primer_apellido: string;
    numero_telefono: string;
    fecha_nacimiento: string;
    correo?: string | undefined;
    segundo_nombre?: string | undefined;
    segundo_apellido?: string | undefined;
    cedula?: string | undefined;
    ocupacion?: string | undefined;
    genero?: "Masculino" | "Femenino" | "Otro" | undefined;
}, {
    primer_nombre: string;
    primer_apellido: string;
    numero_telefono: string;
    fecha_nacimiento: string;
    correo?: string | undefined;
    segundo_nombre?: string | undefined;
    segundo_apellido?: string | undefined;
    cedula?: string | undefined;
    ocupacion?: string | undefined;
    genero?: "Masculino" | "Femenino" | "Otro" | undefined;
}>;
export type CrearPacienteDto = z.infer<typeof PacienteSchema>;
export type ActualizarPacienteDto = Partial<CrearPacienteDto>;
//# sourceMappingURL=pacientes.types.d.ts.map