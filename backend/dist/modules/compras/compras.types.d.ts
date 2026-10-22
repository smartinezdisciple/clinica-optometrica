import { z } from 'zod';
export declare const CrearProveedorSchema: z.ZodObject<{
    nombre_empresa: z.ZodString;
    nombre_contacto: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    telefono: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    correo: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    direccion: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    ruc: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type CrearProveedorDto = z.infer<typeof CrearProveedorSchema>;
export interface Proveedor {
    id_proveedor: number;
    nombre_empresa: string;
    nombre_contacto: string | null;
    telefono: string | null;
    correo: string | null;
    direccion: string | null;
    ruc: string | null;
    activo: boolean;
}
export declare const NuevoProductoCompraSchema: z.ZodObject<{
    nombre_producto: z.ZodString;
    codigo_producto: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    descripcion_producto: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    tipo_producto: z.ZodEnum<{
        accesorio: "accesorio";
        gafas_sol: "gafas_sol";
        lente_comercial: "lente_comercial";
        marco_oftalmologico: "marco_oftalmologico";
    }>;
    tipo_manejo: z.ZodEnum<{
        granel: "granel";
        serializado: "serializado";
    }>;
    precio_venta: z.ZodNumber;
    precio_compra: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    marca: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const ItemCompraSchema: z.ZodObject<{
    id_producto: z.ZodOptional<z.ZodNumber>;
    nuevoProducto: z.ZodOptional<z.ZodObject<{
        nombre_producto: z.ZodString;
        codigo_producto: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        descripcion_producto: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        tipo_producto: z.ZodEnum<{
            accesorio: "accesorio";
            gafas_sol: "gafas_sol";
            lente_comercial: "lente_comercial";
            marco_oftalmologico: "marco_oftalmologico";
        }>;
        tipo_manejo: z.ZodEnum<{
            granel: "granel";
            serializado: "serializado";
        }>;
        precio_venta: z.ZodNumber;
        precio_compra: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        marca: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>>;
    cantidad: z.ZodOptional<z.ZodNumber>;
    seriales: z.ZodOptional<z.ZodArray<z.ZodString>>;
    precio_unitario: z.ZodNumber;
}, z.core.$strip>;
export type ItemCompra = z.infer<typeof ItemCompraSchema>;
export declare const CrearCompraSchema: z.ZodObject<{
    id_proveedor: z.ZodNumber;
    observaciones: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    recibida: z.ZodDefault<z.ZodBoolean>;
    items: z.ZodArray<z.ZodObject<{
        id_producto: z.ZodOptional<z.ZodNumber>;
        nuevoProducto: z.ZodOptional<z.ZodObject<{
            nombre_producto: z.ZodString;
            codigo_producto: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            descripcion_producto: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            tipo_producto: z.ZodEnum<{
                accesorio: "accesorio";
                gafas_sol: "gafas_sol";
                lente_comercial: "lente_comercial";
                marco_oftalmologico: "marco_oftalmologico";
            }>;
            tipo_manejo: z.ZodEnum<{
                granel: "granel";
                serializado: "serializado";
            }>;
            precio_venta: z.ZodNumber;
            precio_compra: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            marca: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        }, z.core.$strip>>;
        cantidad: z.ZodOptional<z.ZodNumber>;
        seriales: z.ZodOptional<z.ZodArray<z.ZodString>>;
        precio_unitario: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type CrearCompraDto = z.infer<typeof CrearCompraSchema>;
export declare const AgregarItemsSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id_producto: z.ZodOptional<z.ZodNumber>;
        nuevoProducto: z.ZodOptional<z.ZodObject<{
            nombre_producto: z.ZodString;
            codigo_producto: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            descripcion_producto: z.ZodNullable<z.ZodOptional<z.ZodString>>;
            tipo_producto: z.ZodEnum<{
                accesorio: "accesorio";
                gafas_sol: "gafas_sol";
                lente_comercial: "lente_comercial";
                marco_oftalmologico: "marco_oftalmologico";
            }>;
            tipo_manejo: z.ZodEnum<{
                granel: "granel";
                serializado: "serializado";
            }>;
            precio_venta: z.ZodNumber;
            precio_compra: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
            marca: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        }, z.core.$strip>>;
        cantidad: z.ZodOptional<z.ZodNumber>;
        seriales: z.ZodOptional<z.ZodArray<z.ZodString>>;
        precio_unitario: z.ZodNumber;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const CambiarEstadoCompraSchema: z.ZodObject<{
    estado: z.ZodEnum<{
        cancelada: "cancelada";
        en_proceso: "en_proceso";
        finalizada: "finalizada";
    }>;
}, z.core.$strip>;
export interface DetalleCompra {
    id_detalle_compra: number;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    id_producto: number;
    nombre_producto: string;
    tipo_manejo: string;
    seriales: string[] | null;
    unidadesCreadas: number;
}
export interface CompraList {
    id_compra: number;
    fecha_compra: string;
    estado_compra: string;
    total_compra: number;
    observaciones: string | null;
    id_proveedor: number;
    nombre_empresa: string;
    numero_items: number;
}
export interface CompraDetalle extends CompraList {
    items: DetalleCompra[];
}
//# sourceMappingURL=compras.types.d.ts.map