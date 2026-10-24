import type { DashboardKpisDb, VentaMensualDb, CitaProximaDb, StockBajoDb, ActividadRecienteDb, EficienciaClinicaDb } from './dashboard.types';
export declare function getDashboardKpis(): Promise<DashboardKpisDb>;
export declare function getVentasMensuales(): Promise<VentaMensualDb[]>;
export declare function getProximasCitas(): Promise<CitaProximaDb[]>;
export declare function getStockBajo(): Promise<StockBajoDb[]>;
export declare function getActividadReciente(): Promise<ActividadRecienteDb[]>;
export declare function getEficienciaClinica(): Promise<EficienciaClinicaDb>;
//# sourceMappingURL=dashboard.repository.d.ts.map