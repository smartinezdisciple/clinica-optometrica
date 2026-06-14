import type { CitaDetalleDb, HorarioDisponibleDb, CrearCitaDto, ActualizarCitaDto, CrearHorarioDto, ActualizarHorarioDto } from './citas.types';
/**
 * Obtiene la lista de citas filtrada.
 */
export declare function getCitas(filtros: {
    fecha?: string;
    estado?: string;
    id_empleado?: number;
    id_cliente?: number;
}): Promise<CitaDetalleDb[]>;
/**
 * Obtiene una cita por su ID.
 */
export declare function getCitaById(id: number): Promise<CitaDetalleDb>;
/**
 * Registra una nueva cita verificando disponibilidad y colisiones.
 */
export declare function createCita(dto: CrearCitaDto): Promise<CitaDetalleDb>;
/**
 * Actualiza los datos de una cita.
 */
export declare function updateCita(id: number, dto: ActualizarCitaDto): Promise<CitaDetalleDb>;
/**
 * Cambia el estado de una cita.
 */
export declare function changeCitaEstado(id: number, estado: string): Promise<CitaDetalleDb>;
/**
 * Obtiene los horarios configurados.
 */
export declare function getHorarios(idEmpleado?: number): Promise<HorarioDisponibleDb[]>;
/**
 * Crea un horario de atención para un optometrista.
 */
export declare function createHorario(dto: CrearHorarioDto): Promise<HorarioDisponibleDb>;
/**
 * Modifica un bloque horario.
 */
export declare function updateHorario(id: number, dto: ActualizarHorarioDto): Promise<void>;
/**
 * Elimina un horario.
 */
export declare function deleteHorario(id: number): Promise<void>;
/**
 * Consulta la disponibilidad de horarios de un optometrista para una fecha específica.
 * Genera slots de 30 minutos y los cruza con las citas ya reservadas.
 */
export declare function getDisponibilidad(idEmpleado: number, fecha: string): Promise<{
    hora: string;
    disponible: boolean;
}[]>;
//# sourceMappingURL=citas.service.d.ts.map