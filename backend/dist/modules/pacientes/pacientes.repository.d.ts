import type { PacienteDb, CrearPacienteDto, ActualizarPacienteDto } from './pacientes.types';
/**
 * Obtiene todos los pacientes o filtra según una búsqueda de texto.
 */
export declare function findPacientes(search?: string): Promise<PacienteDb[]>;
/**
 * Busca un paciente por su ID.
 */
export declare function findPacienteById(id: number): Promise<PacienteDb | null>;
/**
 * Busca un cliente (cualquiera) por su cédula.
 */
export declare function findClienteByCedula(cedula: string): Promise<{
    id_cliente: number;
} | null>;
/**
 * Registra un cliente de tipo Persona y su extensión de Paciente en una sola transacción.
 */
export declare function insertPacienteTransaccion(dto: CrearPacienteDto): Promise<number>;
/**
 * Actualiza un cliente de tipo Persona y su extensión de Paciente en una sola transacción.
 */
export declare function updatePacienteTransaccion(id: number, dto: ActualizarPacienteDto): Promise<void>;
/**
 * Elimina un paciente (también elimina la cascada en clientes por FK ON DELETE CASCADE).
 */
export declare function deletePacienteRepo(id: number): Promise<void>;
//# sourceMappingURL=pacientes.repository.d.ts.map