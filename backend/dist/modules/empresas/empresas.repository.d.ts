import type { EmpresaDb, CrearEmpresaDto, ActualizarEmpresaDto } from './empresas.types';
/**
 * Obtiene todas las empresas registradas o filtra por búsqueda.
 */
export declare function findEmpresas(search?: string): Promise<EmpresaDb[]>;
/**
 * Obtiene una empresa por su ID de cliente.
 */
export declare function findEmpresaById(id: number): Promise<EmpresaDb | null>;
/**
 * Busca una empresa por RUC.
 */
export declare function findEmpresaByRuc(ruc: string): Promise<{
    id_cliente: number;
} | null>;
/**
 * Registra un cliente de tipo Empresa y su extensión de Empresa en una transacción.
 */
export declare function insertEmpresaTransaccion(dto: CrearEmpresaDto): Promise<number>;
/**
 * Actualiza los datos de contacto y la información de la empresa en una transacción.
 */
export declare function updateEmpresaTransaccion(id: number, dto: ActualizarEmpresaDto): Promise<void>;
/**
 * Elimina una empresa (remoción en cascada).
 */
export declare function deleteEmpresaRepo(id: number): Promise<void>;
//# sourceMappingURL=empresas.repository.d.ts.map