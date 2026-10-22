import { z } from 'zod';
export interface HorarioDisponibleDb {
    id_horario: number;
    id_empleado: number;
    dia_semana: number;
    hora_inicio: string;
    hora_fin: string;
    activo: boolean;
}
export interface CitaDb {
    id_cita: number;
    motivo_cita: string;
    fecha_hora_cita: Date | string;
    estado_cita: 'confirmada' | 'cancelada' | 'reprogramada' | 'en_espera_confirmacion' | 'completada';
    observaciones: string | null;
    fecha_proxima_revision: Date | string | null;
    id_cliente: number;
    id_empleado: number | null;
}
export interface CitaDetalleDb extends CitaDb {
    paciente_nombre: string;
    paciente_apellido: string;
    paciente_cedula: string | null;
    optometrista_nombre: string | null;
    optometrista_apellido: string | null;
}
export declare const CitaSchema: z.ZodObject<{
    motivo_cita: z.ZodString;
    fecha_hora_cita: z.ZodString;
    estado_cita: z.ZodDefault<z.ZodEnum<{
        cancelada: "cancelada";
        completada: "completada";
        confirmada: "confirmada";
        en_espera_confirmacion: "en_espera_confirmacion";
        reprogramada: "reprogramada";
    }>>;
    observaciones: z.ZodPipe<z.ZodOptional<z.ZodString>, z.ZodTransform<string | undefined, string | undefined>>;
    id_cliente: z.ZodNumber;
    id_empleado: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
export declare const HorarioSchema: z.ZodObject<{
    id_empleado: z.ZodNumber;
    dia_semana: z.ZodNumber;
    hora_inicio: z.ZodString;
    hora_fin: z.ZodString;
    activo: z.ZodDefault<z.ZodBoolean>;
}, z.core.$strip>;
export type CrearCitaDto = z.input<typeof CitaSchema>;
export type ActualizarCitaDto = Partial<z.input<typeof CitaSchema>>;
export type CrearHorarioDto = z.input<typeof HorarioSchema>;
export type ActualizarHorarioDto = Partial<z.input<typeof HorarioSchema>>;
//# sourceMappingURL=citas.types.d.ts.map