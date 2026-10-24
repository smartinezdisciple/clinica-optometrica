import type { CrearProductoDto, ProductoInventario, RegistrarMovimientoDto, UnidadSerializadaDb } from './inventario.types';
/**
 * Listado del catálogo con etiquetas amigables para el frontend.
 */
export declare function getProductosInventario(sucursalId: number): Promise<ProductoInventario[]>;
/**
 * Unidades serializadas de un producto (con estado y sucursal).
 */
export declare function getUnidadesSerializadas(productoId: number, sucursalId: number): Promise<UnidadSerializadaDb[]>;
/**
 * Alta de un nuevo producto en el catálogo (granel o serializado).
 */
export declare function crearProducto(dto: CrearProductoDto, sucursalId: number, usuarioId: number): Promise<{
    producto: ProductoInventario;
    unidadesCreadas: number;
}>;
/**
 * Registro de unidades serializadas adicionales (ingreso directo en inventario).
 */
export declare function registrarSeriales(productoId: number, seriales: string[], sucursalId: number): Promise<{
    unidadesCreadas: number;
}>;
/**
 * Registro de movimiento de inventario (granel). Rechaza productos serializados,
 * cuyos cambios de existencia se manejan por unidades (seriales).
 */
export declare function registrarMovimiento(dto: RegistrarMovimientoDto, sucursalId: number, usuarioId: number): Promise<void>;
//# sourceMappingURL=inventario.service.d.ts.map