import { z } from 'zod';
export interface ClienteDb {
    id_cliente: number;
    cedula: string | null;
    nombres: string;
    apellidos: string;
    tipo_cliente: 'Persona' | 'Empresa';
    numero_telefono: string;
    correo: string | null;
    fecha_registro: Date;
}
export interface PacienteDb extends ClienteDb {
    ocupacion: string | null;
    fecha_nacimiento: Date | string;
    genero: 'Masculino' | 'Femenino' | 'Otro' | null;
    id_empresa: number | null;
}
export declare const PacienteSchema: z.ZodObject<{
    cedula: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
    nombres: z.ZodString;
    apellidos: z.ZodString;
    numero_telefono: z.ZodString;
    correo: z.ZodPipe<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>, z.ZodTransform<string | undefined, string | undefined>>;
    ocupacion: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
    fecha_nacimiento: z.ZodString;
    genero: z.ZodOptional<z.ZodEnum<{
        Femenino: "Femenino";
        Masculino: "Masculino";
        Otro: "Otro";
    }>>;
    id_empresa: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
export type CrearPacienteDto = z.infer<typeof PacienteSchema>;
export type ActualizarPacienteDto = Partial<CrearPacienteDto>;
//# sourceMappingURL=pacientes.types.d.ts.map