import type { CrearProductoDto, ProductoInventarioDb, UnidadSerializadaDb } from './inventario.types';
/**
 * Obtiene el catálogo de productos activos de la sucursal (granel y serializados).
 * Para productos serializados, la cantidad mostrada es el conteo de unidades
 * disponibles; para granel, el valor de `inventario_sucursal.cantidad`.
 */
export declare function findProductosInventario(sucursalId: number): Promise<ProductoInventarioDb[]>;
/**
 * Obtiene las unidades serializadas de un producto en la sucursal, con su estado.
 */
export declare function findUnidadesByProducto(sucursalId: number, productoId: number): Promise<UnidadSerializadaDb[]>;
/**
 * Verifica que un producto exista y devuelve su tipo de manejo.
 */
export declare function findProductoManejo(productoId: number): Promise<string | null>;
export declare function findProductoById(productoId: number): Promise<boolean>;
/**
 * Crea un producto en transacción. Para granel registra stock inicial;
 * para serializado registra las unidades iniciales (número de serie).
 * Devuelve el id y el conteo de unidades creadas.
 */
export declare function createProductoInTx(dto: CrearProductoDto, sucursalId: number, usuarioId: number): Promise<{
    idProducto: number;
    unidadesCreadas: number;
}>;
/**
 * Registra unidades serializadas de un producto ya existente (ingreso directo).
 */
export declare function insertSerialesByProducto(productoId: number, sucursalId: number, seriales: string[]): Promise<number>;
/**
 * Registra un movimiento de inventario para productos granel.
 * - entrada:     +cantidad
 * - salida/perdida: -cantidad (requiere stock suficiente)
 * - ajuste:      cantidad con signo (positivo suma, negativo resta)
 */
export declare function crearMovimientoGranelInTx(productoId: number, sucursalId: number, usuarioId: number, tipoMovimiento: 'entrada' | 'salida' | 'ajuste' | 'perdida', cantidad: number, motivo: string | null): Promise<void>;
//# sourceMappingURL=inventario.repository.d.ts.map