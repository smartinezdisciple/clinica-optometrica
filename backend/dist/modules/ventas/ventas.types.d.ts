import { z } from 'zod';
export type EstadoVenta = 'en_proceso' | 'finalizada' | 'cancelada';
export type TipoManejo = 'granel' | 'serializado';
/**
 * Línea del carrito. Para productos granel se usa `cantidad`; para
 * productos serializados se exige `id_unidad_serializada` (una línea por unidad).
 */
export declare const ItemVentaSchema: z.ZodObject<{
    id_producto: z.ZodNumber;
    cantidad: z.ZodDefault<z.ZodNumber>;
    id_unidad_serializada: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
}, z.core.$strip>;
export type ItemVentaDto = z.infer<typeof ItemVentaSchema>;
export declare const CrearVentaSchema: z.ZodObject<{
    id_cliente: z.ZodNumber;
    descuento_porcentaje: z.ZodDefault<z.ZodNumber>;
    nota: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    id_metodo_pago: z.ZodNumber;
    referencia_pago: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    items: z.ZodArray<z.ZodObject<{
        id_producto: z.ZodNumber;
        cantidad: z.ZodDefault<z.ZodNumber>;
        id_unidad_serializada: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type CrearVentaDto = z.infer<typeof CrearVentaSchema>;
export declare const RegistrarPagoSchema: z.ZodObject<{
    id_metodo_pago: z.ZodNumber;
    referencia_pago: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    nota: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type RegistrarPagoDto = z.infer<typeof RegistrarPagoSchema>;
export declare const CambiarEstadoVentaSchema: z.ZodObject<{
    estado: z.ZodEnum<{
        cancelada: "cancelada";
        en_proceso: "en_proceso";
        finalizada: "finalizada";
    }>;
}, z.core.$strip>;
export type CambiarEstadoVentaDto = z.infer<typeof CambiarEstadoVentaSchema>;
export declare const ListarVentasQuerySchema: z.ZodObject<{
    estado: z.ZodOptional<z.ZodEnum<{
        cancelada: "cancelada";
        en_proceso: "en_proceso";
        finalizada: "finalizada";
    }>>;
    busqueda: z.ZodOptional<z.ZodString>;
    fecha_desde: z.ZodOptional<z.ZodString>;
    fecha_hasta: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type ListarVentasQuery = z.infer<typeof ListarVentasQuerySchema>;
export interface MetodoPago {
    id_metodo_pago: number;
    nombre_metodo_pago: string;
    descripcion: string | null;
    tipo_metodo_pago: 'fisico' | 'electronico' | 'digital';
}
export interface ProductoVendible {
    id_producto: number;
    nombre_producto: string;
    tipo_producto: string;
    tipo_manejo: TipoManejo;
    precio_venta: number;
    cantidad: number;
}
export interface UnidadSerializadaVenta {
    id_unidad: number;
    numero_serie: string;
    id_producto: number;
}
export interface VentaList {
    id_venta: number;
    fecha_venta: string;
    estado_venta: EstadoVenta;
    subtotal: number;
    descuento_aplicado: number;
    total_venta: number;
    id_cliente: number;
    nombre_cliente: string;
    numero_items: number;
}
export interface VentaItem {
    id_detalle_venta: number;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    nombre_producto: string;
    numero_serie: string | null;
}
export interface PagoVenta {
    id_pago: number;
    monto: number;
    referencia_pago: string | null;
    notas: string | null;
    id_metodo_pago: number;
    nombre_metodo_pago: string;
}
export interface VentaDetalle extends VentaList {
    items: VentaItem[];
    pago: PagoVenta | null;
}
export interface ResumenVentas {
    totalVendido: number;
    numeroVentas: number;
}
export interface CrearVentaResultado {
    id_venta: number;
    subtotal: number;
    descuento_aplicado: number;
    total: number;
    estado: EstadoVenta;
}
export interface ItemVentaResuelto {
    id_producto: number | null;
    cantidad: number;
    precio_unitario: number;
    id_unidad_serializada: number | null;
}
//# sourceMappingURL=ventas.types.d.ts.map