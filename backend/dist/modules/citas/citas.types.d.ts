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
    fecha_hora_cita: z.ZodEffects<z.ZodString, string, string>;
    estado_cita: z.ZodDefault<z.ZodEnum<["confirmada", "cancelada", "reprogramada", "en_espera_confirmacion", "completada"]>>;
    observaciones: z.ZodEffects<z.ZodOptional<z.ZodString>, string | undefined, string | undefined>;
    id_cliente: z.ZodNumber;
    id_empleado: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
}, "strip", z.ZodTypeAny, {
    motivo_cita: string;
    fecha_hora_cita: string;
    estado_cita: "confirmada" | "cancelada" | "reprogramada" | "en_espera_confirmacion" | "completada";
    id_cliente: number;
    observaciones?: string | undefined;
    id_empleado?: number | null | undefined;
}, {
    motivo_cita: string;
    fecha_hora_cita: string;
    id_cliente: number;
    estado_cita?: "confirmada" | "cancelada" | "reprogramada" | "en_espera_confirmacion" | "completada" | undefined;
    observaciones?: string | undefined;
    id_empleado?: number | null | undefined;
}>;
export declare const HorarioSchema: z.ZodObject<{
    id_empleado: z.ZodNumber;
    dia_semana: z.ZodNumber;
    hora_inicio: z.ZodString;
    hora_fin: z.ZodString;
    activo: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    activo: boolean;
    id_empleado: number;
    dia_semana: number;
    hora_inicio: string;
    hora_fin: string;
}, {
    id_empleado: number;
    dia_semana: number;
    hora_inicio: string;
    hora_fin: string;
    activo?: boolean | undefined;
}>;
export type CrearCitaDto = z.input<typeof CitaSchema>;
export type ActualizarCitaDto = Partial<z.input<typeof CitaSchema>>;
export type CrearHorarioDto = z.input<typeof HorarioSchema>;
export type ActualizarHorarioDto = Partial<z.input<typeof HorarioSchema>>;
//# sourceMappingURL=citas.types.d.ts.map