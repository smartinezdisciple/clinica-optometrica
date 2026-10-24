import type { CrearVentaDto, CrearVentaResultado, EstadoVenta, ListarVentasQuery, MetodoPago, ProductoVendible, ResumenVentas, UnidadSerializadaVenta, VentaDetalle, VentaList } from './ventas.types';
export declare function getMetodosPago(): Promise<MetodoPago[]>;
export declare function getProductosVendibles(sucursalId: number): Promise<ProductoVendible[]>;
export declare function getSerialesDisponibles(productoId: number, sucursalId: number): Promise<UnidadSerializadaVenta[]>;
export declare function getVentas(filtros: ListarVentasQuery): Promise<VentaList[]>;
export declare function getVenta(idVenta: number): Promise<VentaDetalle>;
export declare function getResumen(filtros: ListarVentasQuery): Promise<ResumenVentas>;
/**
 * Registra una venta finalizada con su pago.
 *
 * Valida cliente, método de pago y cada ítem (existencia, stock y unidades
 * serializadas disponibles). El inventario y los totales los calcula la BD.
 */
export declare function crearVenta(dto: CrearVentaDto, usuarioId: number, sucursalId: number): Promise<CrearVentaResultado>;
export declare function cambiarEstadoVenta(idVenta: number, estado: EstadoVenta, usuarioId: number): Promise<void>;
//# sourceMappingURL=ventas.service.d.ts.map