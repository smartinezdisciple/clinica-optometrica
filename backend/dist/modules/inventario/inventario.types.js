"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnidadSerializadaSchema = exports.ProductoInventarioSchema = exports.RegistrarMovimientoSchema = exports.RegistrarSerialesSchema = exports.CrearProductoSchema = void 0;
const zod_1 = require("zod");
// ─── DTOs (Zod) ────────────────────────────────────────────────────────────────
const TipoProductoSchema = zod_1.z.enum(['accesorio', 'gafas_sol', 'marco_oftalmologico', 'lente_comercial']);
const TipoManejoSchema = zod_1.z.enum(['granel', 'serializado']);
exports.CrearProductoSchema = zod_1.z.object({
    nombre_producto: zod_1.z.string().min(1, 'El nombre del producto es requerido').max(50),
    codigo_producto: zod_1.z.string().max(30).optional().nullable(),
    descripcion_producto: zod_1.z.string().max(500).optional().nullable(),
    tipo_producto: TipoProductoSchema,
    tipo_manejo: TipoManejoSchema.default('granel'),
    precio_venta: zod_1.z.number().min(0, 'El precio de venta no puede ser negativo'),
    precio_compra: zod_1.z.number().min(0).optional().nullable(),
    marca: zod_1.z.string().max(30).optional().nullable(),
    // Stock inicial para granel
    stock_inicial: zod_1.z.number().int().min(0).max(1000000).optional().default(0),
    // Números de serie iniciales para serializado
    seriales: zod_1.z.array(zod_1.z.string().min(1).max(50)).optional().default([]),
});
exports.RegistrarSerialesSchema = zod_1.z.object({
    seriales: zod_1.z.array(zod_1.z.string().trim().min(1).max(50), { message: 'La lista de seriales es requerida' })
        .min(1, 'Debe registrar al menos un número de serie'),
});
exports.RegistrarMovimientoSchema = zod_1.z.object({
    id_producto: zod_1.z.number().int().positive(),
    cantidad: zod_1.z.number().int().refine((v) => v !== 0, 'La cantidad debe ser distinta de 0'),
    tipo_movimiento: zod_1.z.enum(['entrada', 'salida', 'ajuste', 'perdida']),
    motivo: zod_1.z.string().max(300).optional().nullable(),
});
exports.ProductoInventarioSchema = zod_1.z.object({
    id_producto: zod_1.z.number().int().positive(),
    enumeracion: zod_1.z.string(),
    nombre_producto: zod_1.z.string(),
    tipo_producto: zod_1.z.string(),
    tipo_producto_label: zod_1.z.string(),
    tipo_manejo: TipoManejoSchema,
    tipo_manejo_label: zod_1.z.string(),
    precio_venta: zod_1.z.number(),
    cantidad: zod_1.z.number().int(),
    cantidad_granel: zod_1.z.number().int().nullable(),
    cantidad_serializada: zod_1.z.number().int().nullable(),
    ingresado_por: zod_1.z.string().nullable(),
    fecha_ingreso: zod_1.z.string().nullable(),
    marca: zod_1.z.string().nullable(),
});
exports.UnidadSerializadaSchema = zod_1.z.object({
    id_unidad: zod_1.z.number().int().positive(),
    numero_serie: zod_1.z.string(),
    estado: zod_1.z.enum(['disponible', 'reservado', 'vendido', 'descartado']),
    fecha_ingreso: zod_1.z.string().nullable(),
    fecha_venta: zod_1.z.string().nullable(),
    id_sucursal: zod_1.z.number().int().nullable(),
    nombre_sucursal: zod_1.z.string().nullable(),
});
//# sourceMappingURL=inventario.types.js.map