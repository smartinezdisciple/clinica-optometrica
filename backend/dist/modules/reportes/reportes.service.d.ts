import type { FiltrosInventarioInput, FiltrosReporte, FiltrosReporteInput, ReporteCitas, ReporteCompras, ReporteInventario, ReporteVentas, TipoReporte } from './reportes.types';
/**
 * Resuelve fechas por defecto (mes actual) y valida el rango.
 * `id_sucursal = null` significa "todas las sucursales".
 */
export declare function normalizarFiltros(input: FiltrosReporteInput): FiltrosReporte;
export declare function getReporteVentas(input: FiltrosReporteInput): Promise<ReporteVentas>;
export declare function getReporteCompras(input: FiltrosReporteInput): Promise<ReporteCompras>;
export declare function getReporteCitas(input: FiltrosReporteInput): Promise<ReporteCitas>;
export declare function getReporteInventario(input: FiltrosInventarioInput): Promise<ReporteInventario>;
/** Despacha al reporte solicitado (usado por la exportación). */
export declare function getReporte(tipo: TipoReporte, input: FiltrosReporteInput): Promise<ReporteVentas | ReporteCompras | ReporteCitas | ReporteInventario>;
//# sourceMappingURL=reportes.service.d.ts.map