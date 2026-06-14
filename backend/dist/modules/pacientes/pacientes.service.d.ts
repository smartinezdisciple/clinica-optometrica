import type { CrearPacienteDto, ActualizarPacienteDto, PacienteDb } from './pacientes.types';
/**
 * Obtiene todos los pacientes o filtra según una búsqueda de texto.
 */
export declare function getPacientes(search?: string): Promise<PacienteDb[]>;
/**
 * Obtiene un paciente por su ID.
 */
export declare function getPacienteById(id: number): Promise<PacienteDb>;
/**
 * Registra un nuevo paciente en el sistema.
 */
export declare function createPaciente(dto: CrearPacienteDto): Promise<PacienteDb>;
/**
 * Actualiza los datos de un paciente existente.
 */
export declare function updatePaciente(id: number, dto: ActualizarPacienteDto): Promise<PacienteDb>;
/**
 * Elimina un paciente por su ID.
 */
export declare function deletePaciente(id: number): Promise<void>;
//# sourceMappingURL=pacientes.service.d.ts.map