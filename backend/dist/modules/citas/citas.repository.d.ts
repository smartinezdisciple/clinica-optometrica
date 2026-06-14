import type { CitaDb, CitaDetalleDb, HorarioDisponibleDb, CrearCitaDto, ActualizarCitaDto, CrearHorarioDto, ActualizarHorarioDto } from './citas.types';
/**
 * Obtiene el listado de citas aplicando filtros opcionales.
 */
export declare function findCitas(filtros: {
    fecha?: string;
    estado?: string;
    id_empleado?: number;
    id_cliente?: number;
}): Promise<CitaDetalleDb[]>;
/**
 * Obtiene los detalles de una cita por su ID.
 */
export declare function findCitaById(id: number): Promise<CitaDetalleDb | null>;
/**
 * Registra una nueva cita.
 */
export declare function insertCita(dto: CrearCitaDto): Promise<number>;
/**
 * Actualiza los datos de una cita.
 */
export declare function updateCita(id: number, dto: ActualizarCitaDto): Promise<void>;
/**
 * Actualiza el estado de una cita.
 */
export declare function updateCitaEstado(id: number, estado: string): Promise<void>;
/**
 * Busca si un optometrista tiene alguna cita que colisione a la misma fecha y hora.
 * (Solo evalúa estados activos: confirmada, reprogramada, en_espera_confirmacion).
 */
export declare function findCitasConflicto(idEmpleado: number, fechaHora: string, excluirIdCita?: number): Promise<CitaDb[]>;
/**
 * Obtiene los horarios configurados para los optometristas.
 */
export declare function findHorarios(idEmpleado?: number): Promise<HorarioDisponibleDb[]>;
/**
 * Busca si existe un horario específico configurado para un empleado en un día de la semana.
 */
export declare function findHorariosPorDiaYHora(idEmpleado: number, diaSemana: number, hora: string): Promise<HorarioDisponibleDb[]>;
/**
 * Agrega un nuevo horario disponible para un optometrista.
 */
export declare function insertHorario(dto: CrearHorarioDto): Promise<number>;
/**
 * Modifica un horario disponible.
 */
export declare function updateHorario(id: number, dto: ActualizarHorarioDto): Promise<void>;
/**
 * Elimina un horario disponible.
 */
export declare function deleteHorarioRepo(id: number): Promise<void>;
//# sourceMappingURL=citas.repository.d.ts.map