import type { CompraDetalle, CompraList, CrearProveedorDto, ItemCompra, Proveedor } from './compras.types';
export declare function findProveedores(): Promise<Proveedor[]>;
export declare function insertProveedor(dto: CrearProveedorDto): Promise<Proveedor>;
export declare function findCompras(): Promise<CompraList[]>;
export declare function findCompraById(idCompra: number): Promise<CompraDetalle | null>;
export interface CrearCompraParams {
    empleadoId: number;
    sucursalId: number;
    proveedorId: number;
    observaciones: string | null;
    recibida: boolean;
    items: ItemCompra[];
}
export interface ResultadoItem {
    id_producto: number;
    nombre_producto: string;
    tipo_manejo: string;
    cantidad: number;
    unidadesCreadas: number;
}
export interface ResultadoCompra {
    id_compra: number;
    estado: string;
    total: number;
    items: ResultadoItem[];
}
/**
 * Crea la compra con sus ítems en una sola transacción.
 * - Inserta/actualiza productos nuevos.
 * - Inserta detalles_compra (el trigger de la BD suma el inventario granel).
 * - Para serializados, registra las unidades con su número de serie.
 */
export declare function createCompraInTx(params: CrearCompraParams): Promise<ResultadoCompra>;
/**
 * Añade ítems a una compra existente en estado 'en_proceso'.
 */
export declare function agregarItemsInTx(idCompra: number, sucursalId: number, items: ItemCompra[]): Promise<ResultadoItem[]>;
/**
 * Cambia el estado de una compra.
 */
export declare function updateEstadoCompra(idCompra: number, estado: string): Promise<void>;
//# sourceMappingURL=compras.repository.d.ts.map