import type { DocumentoExport, FiltrosReporte, ReporteCitas, ReporteCompras, ReporteInventario, ReporteVentas, TipoReporte } from './reportes.types';
/**
 * Convierte el resultado de un reporte en un documento exportable (secciones
 * tabulares reutilizadas por CSV y PDF).
 */
export declare function construirDocumento(tipo: TipoReporte, data: ReporteVentas | ReporteCompras | ReporteCitas | ReporteInventario, filtros: FiltrosReporte): DocumentoExport;
export declare function generarCsv(doc: DocumentoExport): string;
export declare function generarPdf(doc: DocumentoExport): Promise<Buffer>;
//# sourceMappingURL=reportes.export.d.ts.map