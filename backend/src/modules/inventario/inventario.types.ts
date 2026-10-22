import { z } from 'zod'

// ─── Tipos de dominio ──────────────────────────────────────────────────────────
export type TipoProducto = 'accesorio' | 'gafas_sol' | 'marco_oftalmologico' | 'lente_comercial'
export type TipoManejo = 'granel' | 'serializado'
export type EstadoUnidad = 'disponible' | 'reservado' | 'vendido' | 'descartado'

// ─── Fila de inventario (join con stock) ───────────────────────────────────────
export interface ProductoInventarioDb {
  id_producto:         number
  enumeracion:         string
  nombre_producto:     string
  tipo_producto:       string
  tipo_manejo:         TipoManejo
  precio_venta:        number
  cantidad:            number
  cantidad_granel:     number | null
  cantidad_serializada: number | null
  ingresado_por:       string | null
  fecha_ingreso:       Date | null
  marca:               string | null
}

export interface ProductoInventario extends ProductoInventarioDb {
  tipo_producto_label: string
  tipo_manejo_label:   string
}

export interface UnidadSerializadaDb {
  id_unidad:       number
  numero_serie:    string
  estado:          EstadoUnidad
  fecha_ingreso:   Date | null
  fecha_venta:     Date | null
  id_sucursal:     number | null
  nombre_sucursal: string | null
}

// ─── DTOs (Zod) ────────────────────────────────────────────────────────────────
const TipoProductoSchema = z.enum(['accesorio', 'gafas_sol', 'marco_oftalmologico', 'lente_comercial'])
const TipoManejoSchema = z.enum(['granel', 'serializado'])

export const CrearProductoSchema = z.object({
  nombre_producto:  z.string().min(1, 'El nombre del producto es requerido').max(50),
  codigo_producto:  z.string().max(30).optional().nullable(),
  descripcion_producto: z.string().max(500).optional().nullable(),
  tipo_producto:    TipoProductoSchema,
  tipo_manejo:      TipoManejoSchema.default('granel'),
  precio_venta:     z.number().min(0, 'El precio de venta no puede ser negativo'),
  precio_compra:    z.number().min(0).optional().nullable(),
  marca:            z.string().max(30).optional().nullable(),
  // Stock inicial para granel
  stock_inicial:    z.number().int().min(0).max(1000000).optional().default(0),
  // Números de serie iniciales para serializado
  seriales:         z.array(z.string().min(1).max(50)).optional().default([]),
})
export type CrearProductoDto = z.infer<typeof CrearProductoSchema>

export const RegistrarSerialesSchema = z.object({
  seriales: z.array(z.string().trim().min(1).max(50), { message: 'La lista de seriales es requerida' })
    .min(1, 'Debe registrar al menos un número de serie'),
})
export type RegistrarSerialesDto = z.infer<typeof RegistrarSerialesSchema>

export const RegistrarMovimientoSchema = z.object({
  id_producto:   z.number().int().positive(),
  cantidad:      z.number().int().refine((v) => v !== 0, 'La cantidad debe ser distinta de 0'),
  tipo_movimiento: z.enum(['entrada', 'salida', 'ajuste', 'perdida']),
  motivo:        z.string().max(300).optional().nullable(),
})
export type RegistrarMovimientoDto = z.infer<typeof RegistrarMovimientoSchema>

export const ProductoInventarioSchema = z.object({
  id_producto:         z.number().int().positive(),
  enumeracion:         z.string(),
  nombre_producto:     z.string(),
  tipo_producto:       z.string(),
  tipo_producto_label: z.string(),
  tipo_manejo:         TipoManejoSchema,
  tipo_manejo_label:   z.string(),
  precio_venta:        z.number(),
  cantidad:            z.number().int(),
  cantidad_granel:     z.number().int().nullable(),
  cantidad_serializada: z.number().int().nullable(),
  ingresado_por:       z.string().nullable(),
  fecha_ingreso:       z.string().nullable(),
  marca:               z.string().nullable(),
})

export const UnidadSerializadaSchema = z.object({
  id_unidad:       z.number().int().positive(),
  numero_serie:    z.string(),
  estado:          z.enum(['disponible', 'reservado', 'vendido', 'descartado']),
  fecha_ingreso:   z.string().nullable(),
  fecha_venta:     z.string().nullable(),
  id_sucursal:     z.number().int().nullable(),
  nombre_sucursal: z.string().nullable(),
})