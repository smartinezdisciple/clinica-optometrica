import type { AperturaDto, Caja, CierreCajaDto, MovimientoCaja, MovimientoCajaDto, ResumenCaja } from './caja.types';
export declare function getCajas(sucursalId: number): Promise<Caja[]>;
export declare function createCaja(dto: {
    nombre_caja: string;
}, sucursalId: number): Promise<Caja>;
export declare function setActivaCaja(idCaja: number, activa: boolean): Promise<void>;
export declare function getEstadoCaja(idCaja: number): Promise<{
    caja: Caja;
    resumen: ResumenCaja;
}>;
export declare function abrirCaja(idCaja: number, usuarioId: number, dto: AperturaDto): Promise<{
    caja: Caja;
    apertura: import("./caja.types").AperturaActiva;
    resumen: ResumenCaja;
}>;
export declare function registrarMovimientoCaja(idCaja: number, usuarioId: number, dto: MovimientoCajaDto): Promise<MovimientoCaja>;
export declare function listMovimientosCaja(idCaja: number, soloAperturaActiva: boolean): Promise<MovimientoCaja[]>;
export declare function cerrarCaja(idCaja: number, usuarioId: number, dto: CierreCajaDto): Promise<{
    caja: Caja;
    apertura: import("./caja.types").AperturaActiva;
    cierre: {
        id_cierre: number;
        diferencia: number;
    };
    montoEsperado: number;
    diferencia: number;
}>;
//# sourceMappingURL=caja.service.d.ts.map