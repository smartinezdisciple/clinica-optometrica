"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CambiarEstadoCompraSchema = exports.AgregarItemsSchema = exports.CrearCompraSchema = exports.ItemCompraSchema = exports.NuevoProductoCompraSchema = exports.CrearProveedorSchema = void 0;
const zod_1 = require("zod");
// ─── Proveedores ───────────────────────────────────────────────────────────────
exports.CrearProveedorSchema = zod_1.z.object({
    nombre_empresa: zod_1.z.string().min(1, 'El nombre de la empresa es requerido').max(50),
    nombre_contacto: zod_1.z.string().max(40).optional().nullable(),
    telefono: zod_1.z.string().max(15).optional().nullable(),
    correo: zod_1.z.string().max(100).optional().nullable().refine((v) => !v || v.includes('@'), 'Correo inválido'),
    direccion: zod_1.z.string().max(500).optional().nullable(),
    ruc: zod_1.z.string().max(30).optional().nullable(),
});
// ─── Ítems de compra ───────────────────────────────────────────────────────────
exports.NuevoProductoCompraSchema = zod_1.z.object({
    nombre_producto: zod_1.z.string().min(1).max(50),
    codigo_producto: zod_1.z.string().max(30).optional().nullable(),
    descripcion_producto: zod_1.z.string().max(500).optional().nullable(),
    tipo_producto: zod_1.z.enum(['accesorio', 'gafas_sol', 'marco_oftalmologico', 'lente_comercial']),
    tipo_manejo: zod_1.z.enum(['granel', 'serializado']),
    precio_venta: zod_1.z.number().min(0),
    precio_compra: zod_1.z.number().min(0).optional().nullable(),
    marca: zod_1.z.string().max(30).optional().nullable(),
});
exports.ItemCompraSchema = zod_1.z.object({
    // Producto existente en el catálogo (opcional si viene nuevoProducto)
    id_producto: zod_1.z.number().int().positive().optional(),
    // Alta de producto nueva dentro de la compra (opcional si viene id_producto)
    nuevoProducto: exports.NuevoProductoCompraSchema.optional(),
    // Granel: cantidad de unidades. Serializado: se cuenta por seriales.
    cantidad: zod_1.z.number().int().min(1).optional(),
    // Serializado: número de serie de cada unidad recibida
    seriales: zod_1.z.array(zod_1.z.string().trim().min(1).max(50)).optional(),
    precio_unitario: zod_1.z.number().min(0, 'El precio unitario no puede ser negativo'),
}).superRefine((item, ctx) => {
    if (!item.id_producto && !item.nuevoProducto) {
        ctx.addIssue({ code: 'custom', message: 'Cada ítem necesita id_producto o nuevoProducto' });
    }
    if ((item.cantidad && item.cantidad > 0) && item.seriales && item.seriales.length > 0) {
        ctx.addIssue({ code: 'custom', message: 'Un ítem no puede tener cantidad y seriales a la vez' });
    }
});
// ─── Compra ────────────────────────────────────────────────────────────────────
exports.CrearCompraSchema = zod_1.z.object({
    id_proveedor: zod_1.z.number().int().positive(),
    observaciones: zod_1.z.string().max(500).optional().nullable(),
    // Si true, la compra se marca como recibida (finalizada) al guardar
    recibida: zod_1.z.boolean().default(false),
    items: zod_1.z.array(exports.ItemCompraSchema).min(1, 'La compra debe tener al menos un ítem'),
});
exports.AgregarItemsSchema = zod_1.z.object({
    items: zod_1.z.array(exports.ItemCompraSchema).min(1),
});
exports.CambiarEstadoCompraSchema = zod_1.z.object({
    estado: zod_1.z.enum(['en_proceso', 'finalizada', 'cancelada']),
});
//# sourceMappingURL=compras.types.js.map