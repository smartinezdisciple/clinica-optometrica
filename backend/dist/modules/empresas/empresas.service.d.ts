import type { CrearEmpresaDto, ActualizarEmpresaDto, EmpresaDb } from './empresas.types';
/**
 * Obtiene el listado de todas las empresas o filtra por búsqueda.
 */
export declare function getEmpresas(search?: string): Promise<EmpresaDb[]>;
/**
 * Obtiene los detalles de una empresa por su ID.
 */
export declare function getEmpresaById(id: number): Promise<EmpresaDb>;
/**
 * Registra una nueva empresa en el sistema.
 */
export declare function createEmpresa(dto: CrearEmpresaDto): Promise<EmpresaDb>;
/**
 * Actualiza los datos de una empresa existente.
 */
export declare function updateEmpresa(id: number, dto: ActualizarEmpresaDto): Promise<EmpresaDb>;
/**
 * Elimina una empresa del sistema.
 */
export declare function deleteEmpresa(id: number): Promise<void>;
//# sourceMappingURL=empresas.service.d.ts.map