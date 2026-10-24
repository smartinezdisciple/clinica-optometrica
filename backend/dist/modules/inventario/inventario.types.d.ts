import { z } from 'zod';
export type TipoProducto = 'accesorio' | 'gafas_sol' | 'marco_oftalmologico' | 'lente_comercial';
export type TipoManejo = 'granel' | 'serializado';
export type EstadoUnidad = 'disponible' | 'reservado' | 'vendido' | 'descartado';
export interface ProductoInventarioDb {
    id_producto: number;
    enumeracion: string;
    nombre_producto: string;
    tipo_producto: string;
    tipo_manejo: TipoManejo;
    precio_venta: number;
    cantidad: number;
    cantidad_granel: number | null;
    cantidad_serializada: number | null;
    ingresado_por: string | null;
    fecha_ingreso: Date | null;
    marca: string | null;
}
export interface ProductoInventario extends ProductoInventarioDb {
    tipo_producto_label: string;
    tipo_manejo_label: string;
}
export interface UnidadSerializadaDb {
    id_unidad: number;
    numero_serie: string;
    estado: EstadoUnidad;
    fecha_ingreso: Date | null;
    fecha_venta: Date | null;
    id_sucursal: number | null;
    nombre_sucursal: string | null;
}
export declare const CrearProductoSchema: z.ZodObject<{
    nombre_producto: z.ZodString;
    codigo_producto: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    descripcion_producto: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    tipo_producto: z.ZodEnum<{
        accesorio: "accesorio";
        gafas_sol: "gafas_sol";
        lente_comercial: "lente_comercial";
        marco_oftalmologico: "marco_oftalmologico";
    }>;
    tipo_manejo: z.ZodDefault<z.ZodEnum<{
        granel: "granel";
        serializado: "serializado";
    }>>;
    precio_venta: z.ZodNumber;
    precio_compra: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    marca: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    stock_inicial: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    seriales: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodString>>>;
}, z.core.$strip>;
export type CrearProductoDto = z.infer<typeof CrearProductoSchema>;
export declare const RegistrarSerialesSchema: z.ZodObject<{
    seriales: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
export type RegistrarSerialesDto = z.infer<typeof RegistrarSerialesSchema>;
export declare const RegistrarMovimientoSchema: z.ZodObject<{
    id_producto: z.ZodNumber;
    cantidad: z.ZodNumber;
    tipo_movimiento: z.ZodEnum<{
        ajuste: "ajuste";
        entrada: "entrada";
        perdida: "perdida";
        salida: "salida";
    }>;
    motivo: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type RegistrarMovimientoDto = z.infer<typeof RegistrarMovimientoSchema>;
export declare const ProductoInventarioSchema: z.ZodObject<{
    id_producto: z.ZodNumber;
    enumeracion: z.ZodString;
    nombre_producto: z.ZodString;
    tipo_producto: z.ZodString;
    tipo_producto_label: z.ZodString;
    tipo_manejo: z.ZodEnum<{
        granel: "granel";
        serializado: "serializado";
    }>;
    tipo_manejo_label: z.ZodString;
    precio_venta: z.ZodNumber;
    cantidad: z.ZodNumber;
    cantidad_granel: z.ZodNullable<z.ZodNumber>;
    cantidad_serializada: z.ZodNullable<z.ZodNumber>;
    ingresado_por: z.ZodNullable<z.ZodString>;
    fecha_ingreso: z.ZodNullable<z.ZodString>;
    marca: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
export declare const UnidadSerializadaSchema: z.ZodObject<{
    id_unidad: z.ZodNumber;
    numero_serie: z.ZodString;
    estado: z.ZodEnum<{
        descartado: "descartado";
        disponible: "disponible";
        reservado: "reservado";
        vendido: "vendido";
    }>;
    fecha_ingreso: z.ZodNullable<z.ZodString>;
    fecha_venta: z.ZodNullable<z.ZodString>;
    id_sucursal: z.ZodNullable<z.ZodNumber>;
    nombre_sucursal: z.ZodNullable<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=inventario.types.d.ts.map