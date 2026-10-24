import { z } from 'zod'

// ─── Proveedores ───────────────────────────────────────────────────────────────
export const CrearProveedorSchema = z.object({
  nombre_empresa:  z.string().min(1, 'El nombre de la empresa es requerido').max(50),
  nombre_contacto: z.string().max(40).optional().nullable(),
  telefono:        z.string().max(15).optional().nullable(),
  correo:          z.string().max(100).optional().nullable().refine(
    (v) => !v || v.includes('@'),
    'Correo inválido'
  ),
  direccion:       z.string().max(500).optional().nullable(),
  ruc:             z.string().max(30).optional().nullable(),
})
export type CrearProveedorDto = z.infer<typeof CrearProveedorSchema>

export interface Proveedor {
  id_proveedor:    number
  nombre_empresa:  string
  nombre_contacto: string | null
  telefono:        string | null
  correo:          string | null
  direccion:       string | null
  ruc:             string | null
  activo:          boolean
}

// ─── Ítems de compra ───────────────────────────────────────────────────────────
export const NuevoProductoCompraSchema = z.object({
  nombre_producto:     z.string().min(1).max(50),
  codigo_producto:     z.string().max(30).optional().nullable(),
  descripcion_producto: z.string().max(500).optional().nullable(),
  tipo_producto:       z.enum(['accesorio', 'gafas_sol', 'marco_oftalmologico', 'lente_comercial']),
  tipo_manejo:         z.enum(['granel', 'serializado']),
  precio_venta:        z.number().min(0),
  precio_compra:       z.number().min(0).optional().nullable(),
  marca:               z.string().max(30).optional().nullable(),
})

export const ItemCompraSchema = z.object({
  // Producto existente en el catálogo (opcional si viene nuevoProducto)
  id_producto:    z.number().int().positive().optional(),
  // Alta de producto nueva dentro de la compra (opcional si viene id_producto)
  nuevoProducto:  NuevoProductoCompraSchema.optional(),
  // Granel: cantidad de unidades. Serializado: se cuenta por seriales.
  cantidad:       z.number().int().min(1).optional(),
  // Serializado: número de serie de cada unidad recibida
  seriales:       z.array(z.string().trim().min(1).max(50)).optional(),
  precio_unitario: z.number().min(0, 'El precio unitario no puede ser negativo'),
}).superRefine((item, ctx) => {
  if (!item.id_producto && !item.nuevoProducto) {
    ctx.addIssue({ code: 'custom', message: 'Cada ítem necesita id_producto o nuevoProducto' })
  }
  if ((item.cantidad && item.cantidad > 0) && item.seriales && item.seriales.length > 0) {
    ctx.addIssue({ code: 'custom', message: 'Un ítem no puede tener cantidad y seriales a la vez' })
  }
})
export type ItemCompra = z.infer<typeof ItemCompraSchema>

// ─── Compra ────────────────────────────────────────────────────────────────────
export const CrearCompraSchema = z.object({
  id_proveedor:  z.number().int().positive(),
  observaciones: z.string().max(500).optional().nullable(),
  // Si true, la compra se marca como recibida (finalizada) al guardar
  recibida:      z.boolean().default(false),
  items:         z.array(ItemCompraSchema).min(1, 'La compra debe tener al menos un ítem'),
})
export type CrearCompraDto = z.infer<typeof CrearCompraSchema>

export const AgregarItemsSchema = z.object({
  items: z.array(ItemCompraSchema).min(1),
})

export const CambiarEstadoCompraSchema = z.object({
  estado: z.enum(['en_proceso', 'finalizada', 'cancelada']),
})

export interface DetalleCompra {
  id_detalle_compra: number
  cantidad:          number
  precio_unitario:   number
  subtotal:          number
  id_producto:       number
  nombre_producto:   string
  tipo_manejo:       string
  seriales:          string[] | null
  unidadesCreadas:   number
}

export interface CompraList {
  id_compra:     number
  fecha_compra:  string
  estado_compra: string
  total_compra:  number
  observaciones: string | null
  id_proveedor:  number
  nombre_empresa: string
  numero_items:  number
}

export interface CompraDetalle extends CompraList {
  items: DetalleCompra[]
}