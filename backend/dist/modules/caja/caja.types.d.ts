import { z } from 'zod';
export interface Caja {
    id_caja: number;
    nombre_caja: string;
    id_sucursal: number;
    activa: boolean;
}
export declare const CrearCajaSchema: z.ZodObject<{
    nombre_caja: z.ZodString;
}, z.core.$strip>;
export type CrearCajaDto = z.infer<typeof CrearCajaSchema>;
export declare const CambiarEstadoCajaSchema: z.ZodObject<{
    activa: z.ZodBoolean;
}, z.core.$strip>;
export declare const AperturaSchema: z.ZodObject<{
    monto_inicial: z.ZodNumber;
    observaciones: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type AperturaDto = z.infer<typeof AperturaSchema>;
export interface AperturaActiva {
    id_apertura: number;
    fecha_apertura: string;
    monto_inicial: number;
    observaciones: string | null;
}
export declare const MovimientoCajaSchema: z.ZodObject<{
    tipo_movimiento: z.ZodEnum<{
        ajuste: "ajuste";
        egreso: "egreso";
        ingreso: "ingreso";
    }>;
    monto: z.ZodNumber;
    descripcion: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type MovimientoCajaDto = z.infer<typeof MovimientoCajaSchema>;
export interface MovimientoCaja {
    id_movimiento: number;
    tipo_movimiento: 'ingreso' | 'egreso' | 'ajuste';
    monto: number;
    descripcion: string | null;
    fecha_movimiento: string;
    id_usuario: number;
    nombre_usuario: string | null;
}
export declare const CierreCajaSchema: z.ZodObject<{
    monto_final: z.ZodNumber;
    observaciones: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type CierreCajaDto = z.infer<typeof CierreCajaSchema>;
export interface ResumenCaja {
    aperturaActiva: AperturaActiva | null;
    montoInicial: number;
    totalIngresos: number;
    totalEgresos: number;
    totalAjustes: number;
    saldoEsperado: number;
}
//# sourceMappingURL=caja.types.d.ts.map