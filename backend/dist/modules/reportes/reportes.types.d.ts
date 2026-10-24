import { z } from 'zod';
export declare const FiltrosReporteSchema: z.ZodObject<{
    desde: z.ZodOptional<z.ZodString>;
    hasta: z.ZodOptional<z.ZodString>;
    id_sucursal: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type FiltrosReporteInput = z.infer<typeof FiltrosReporteSchema>;
export declare const FiltrosInventarioSchema: z.ZodObject<{
    id_sucursal: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export type FiltrosInventarioInput = z.infer<typeof FiltrosInventarioSchema>;
export declare const TipoReporteSchema: z.ZodEnum<{
    citas: "citas";
    compras: "compras";
    inventario: "inventario";
    ventas: "ventas";
}>;
export type TipoReporte = z.infer<typeof TipoReporteSchema>;
export declare const FormatoReporteSchema: z.ZodEnum<{
    csv: "csv";
    pdf: "pdf";
}>;
export type FormatoReporte = z.infer<typeof FormatoReporteSchema>;
export declare const ExportQuerySchema: z.ZodObject<{
    desde: z.ZodOptional<z.ZodString>;
    hasta: z.ZodOptional<z.ZodString>;
    id_sucursal: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
    tipo: z.ZodEnum<{
        citas: "citas";
        compras: "compras";
        inventario: "inventario";
        ventas: "ventas";
    }>;
    formato: z.ZodDefault<z.ZodEnum<{
        csv: "csv";
        pdf: "pdf";
    }>>;
}, z.core.$strip>;
export type ExportQuery = z.infer<typeof ExportQuerySchema>;
/** Filtros ya normalizados (fechas resueltas y sucursal nula = todas). */
export interface FiltrosReporte {
    desde: string;
    hasta: string;
    id_sucursal: number | null;
}
export interface SeriePunto {
    fecha: string;
    total: number;
    cantidad: number;
}
export interface SerieCantidad {
    fecha: string;
    cantidad: number;
}
export interface GrupoMonto {
    etiqueta: string;
    total: number;
    cantidad: number;
}
export interface GrupoCantidad {
    etiqueta: string;
    cantidad: number;
}
export interface TopProducto {
    id_producto: number | null;
    nombre: string;
    cantidad: number;
    total: number;
}
export interface ReporteVentas {
    resumen: {
        totalVendido: number;
        numeroVentas: number;
        ticketPromedio: number;
        totalDescuentos: number;
        subtotal: number;
    };
    serie: SeriePunto[];
    porMetodoPago: GrupoMonto[];
    porSucursal: GrupoMonto[];
    topProductos: TopProducto[];
    porEstado: GrupoMonto[];
}
export interface ReporteCompras {
    resumen: {
        totalComprado: number;
        numeroCompras: number;
        ticketPromedio: number;
    };
    serie: SeriePunto[];
    porProveedor: GrupoMonto[];
    porEstado: GrupoMonto[];
}
export interface ReporteCitas {
    resumen: {
        total: number;
        completadas: number;
        canceladas: number;
        tasaCompletadas: number;
    };
    porEstado: GrupoCantidad[];
    serie: SerieCantidad[];
}
export interface StockBajoItem {
    id_producto: number;
    nombre_producto: string;
    sucursal: string;
    cantidad: number;
    stock_minimo: number;
    faltante: number;
}
export interface ReporteInventario {
    resumen: {
        totalProductos: number;
        agotados: number;
        stockBajo: number;
        valorizacionVenta: number;
    };
    stockBajo: StockBajoItem[];
    porSucursal: GrupoCantidad[];
}
export interface SeccionExport {
    titulo: string;
    columnas: string[];
    filas: Array<Array<string | number>>;
}
export interface DocumentoExport {
    titulo: string;
    subtitulo: string;
    secciones: SeccionExport[];
}
//# sourceMappingURL=reportes.types.d.ts.map