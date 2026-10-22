import type { Request } from 'express';
import type { RegistrarLogInput } from './auditoria.types';
/**
 * Registra un evento de auditoría tomando el contexto (usuario, sucursal e IP)
 * automáticamente del request autenticado.
 *
 * Uso típico desde un servicio de negocio:
 *   await registrarDesdeRequest(req, {
 *     accion: 'Crear usuario',
 *     modulo: 'usuarios',
 *     tipoEvento: TipoEvento.CREATE,
 *     tablaAfectada: 'usuarios',
 *     idEntidad: idCreada,
 *     despues: { ...datosRelevantes },
 *   })
 */
export declare function registrarDesdeRequest(req: Request, input: Omit<RegistrarLogInput, 'idUsuario' | 'idSucursal' | 'ipOrigen'>): Promise<void>;
//# sourceMappingURL=auditoria.context.d.ts.map