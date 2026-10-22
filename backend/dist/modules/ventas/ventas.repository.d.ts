import type { PoolClient } from 'pg';
import type { CrearVentaResultado, EstadoVenta, ItemVentaResuelto, ListarVentasQuery, MetodoPago, ProductoVendible, ResumenVentas, UnidadSerializadaVenta, VentaDetalle, VentaList } from './ventas.types';
export declare function findMetodosPago(): Promise<MetodoPago[]>;
/**
 * Productos activos con stock disponible en la sucursal.
 * Para serializados, la cantidad es el conteo de unidades disponibles.
 */
export declare function findProductosVendibles(sucursalId: number): Promise<ProductoVendible[]>;
export declare function findSerialesDisponibles(productoId: number, sucursalId: number): Promise<UnidadSerializadaVenta[]>;
export interface ProductoVentaInfo {
    id_producto: number;
    nombre_producto: string;
    tipo_manejo: 'granel' | 'serializado';
    precio_venta: number;
    activo: boolean;
}
export declare function findProductoVenta(idProducto: number): Promise<ProductoVentaInfo | null>;
export declare function getStockGranel(idProducto: number, sucursalId: number): Promise<number>;
export interface UnidadVentaInfo {
    id_unidad: number;
    id_producto: number;
    estado: string;
}
export declare function findUnidadVenta(idUnidad: number): Promise<UnidadVentaInfo | null>;
export declare function findMetodoPagoActivo(idMetodoPago: number): Promise<MetodoPago | null>;
export declare function existeCliente(idCliente: number): Promise<boolean>;
export declare function findVentas(filtros: ListarVentasQuery): Promise<VentaList[]>;
export declare function findVentaById(idVenta: number): Promise<VentaDetalle | null>;
export interface CrearVentaParams {
    clienteId: number;
    empleadoId: number;
    usuarioId: number;
    sucursalId: number;
    descuentoAplicado: number;
    nota: string | null;
    metodoPagoId: number;
    referenciaPago: string | null;
    items: ItemVentaResuelto[];
}
/**
 * Registra la venta completa en una sola transacción.
 *
 * Importante: NO actualiza inventario ni totales manualmente. La base de datos
 * los calcula mediante los triggers `tg_restar_inventario_venta` (solo aplica a
 * líneas con `id_producto`) y `tg_calcular_totales_venta`.
 *
 * Para líneas serializadas se envía `id_producto = NULL` y se enlaza la unidad
 * (`id_unidad_serializada`): así el stock no se descuenta por cantidad (el
 * producto se controla por unidades) y la unidad pasa a `vendido`.
 */
export declare function createVentaInTx(params: CrearVentaParams): Promise<CrearVentaResultado>;
/**
 * Devuelve el id de la caja con apertura activa en la sucursal, o null.
 */
export declare function findCajaAbierta(client: PoolClient, sucursalId: number): Promise<number | null>;
/**
 * Cambia el estado de la venta. Al cancelar, revierte el inventario:
 * - Líneas granel (`id_producto`): devuelve la cantidad a `inventario_sucursal`
 *   y registra un movimiento de entrada.
 * - Líneas serializadas: la unidad vuelve a `disponible`.
 */
export declare function updateEstadoVenta(idVenta: number, estado: EstadoVenta, usuarioId: number): Promise<void>;
export declare function getResumenVentas(filtros: ListarVentasQuery): Promise<ResumenVentas>;
//# sourceMappingURL=ventas.repository.d.ts.map