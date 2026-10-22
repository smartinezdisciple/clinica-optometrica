import * as repo from './compras.repository';
import type { CompraDetalle, CompraList, CrearCompraDto, CrearProveedorDto, ItemCompra, Proveedor } from './compras.types';
export declare function getProveedoresList(): Promise<Proveedor[]>;
export declare function createProveedor(dto: CrearProveedorDto): Promise<Proveedor>;
export declare function getComprasList(): Promise<CompraList[]>;
export declare function getCompra(idCompra: number): Promise<CompraDetalle>;
export declare function createCompra(dto: CrearCompraDto, usuarioId: number, sucursalId: number): Promise<repo.ResultadoCompra>;
export declare function addItems(idCompra: number, items: ItemCompra[], sucursalId: number): Promise<{
    id_compra: number;
    items: repo.ResultadoItem[];
    compra: CompraDetalle | null;
}>;
export declare function changeCompraEstado(idCompra: number, estado: 'en_proceso' | 'finalizada' | 'cancelada'): Promise<void>;
//# sourceMappingURL=compras.service.d.ts.map