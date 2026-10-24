import type { AperturaActiva, Caja, MovimientoCaja, ResumenCaja } from './caja.types';
export declare function findCajas(sucursalId: number): Promise<Caja[]>;
export declare function findCaja(idCaja: number): Promise<Caja | null>;
export declare function insertCaja(nombreCaja: string, sucursalId: number): Promise<Caja>;
export declare function setCajaActiva(idCaja: number, activa: boolean): Promise<void>;
export declare function findAperturaActiva(idCaja: number): Promise<AperturaActiva | null>;
export declare function insertApertura(idCaja: number, usuarioId: number, montoInicial: number, observaciones: string | null): Promise<AperturaActiva>;
export declare function getResumenCaja(idCaja: number, aperturaId: number): Promise<ResumenCaja>;
export declare function insertMovimiento(idCaja: number, usuarioId: number, tipo: 'ingreso' | 'egreso' | 'ajuste', monto: number, descripcion: string | null): Promise<MovimientoCaja>;
export declare function findMovimientos(idCaja: number, aperturaId?: number): Promise<MovimientoCaja[]>;
export declare function insertCierre(aperturaId: number, usuarioId: number, montoFinal: number, montoEsperado: number, observaciones: string | null): Promise<{
    id_cierre: number;
    diferencia: number;
}>;
//# sourceMappingURL=caja.repository.d.ts.map