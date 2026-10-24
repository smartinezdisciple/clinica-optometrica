"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizarFiltros = normalizarFiltros;
exports.getReporteVentas = getReporteVentas;
exports.getReporteCompras = getReporteCompras;
exports.getReporteCitas = getReporteCitas;
exports.getReporteInventario = getReporteInventario;
exports.getReporte = getReporte;
const repo = __importStar(require("./reportes.repository"));
const manejo_errores_1 = require("../../middleware/manejo-errores");
// ─── Normalización de filtros ──────────────────────────────────────────────────
function hoyISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function primerDiaMesISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}
function esFechaValida(fecha) {
    const d = new Date(`${fecha}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === fecha;
}
/**
 * Resuelve fechas por defecto (mes actual) y valida el rango.
 * `id_sucursal = null` significa "todas las sucursales".
 */
function normalizarFiltros(input) {
    const hasta = input.hasta ?? hoyISO();
    const desde = input.desde ?? primerDiaMesISO();
    if (!esFechaValida(desde))
        throw new manejo_errores_1.AppError(400, `Fecha "desde" inválida: ${desde}`);
    if (!esFechaValida(hasta))
        throw new manejo_errores_1.AppError(400, `Fecha "hasta" inválida: ${hasta}`);
    if (desde > hasta)
        throw new manejo_errores_1.AppError(400, 'La fecha "desde" no puede ser posterior a "hasta"');
    return { desde, hasta, id_sucursal: input.id_sucursal ?? null };
}
function redondear(valor) {
    return Math.round(valor * 100) / 100;
}
// ─── Reportes ──────────────────────────────────────────────────────────────────
async function getReporteVentas(input) {
    const f = normalizarFiltros(input);
    const [resumen, serie, porMetodoPago, porSucursal, topProductos, porEstado] = await Promise.all([
        repo.findResumenVentas(f),
        repo.findSerieVentas(f),
        repo.findVentasPorMetodoPago(f),
        repo.findVentasPorSucursal(f),
        repo.findTopProductos(f),
        repo.findVentasPorEstado(f),
    ]);
    const ticketPromedio = resumen.numeroVentas > 0
        ? redondear(resumen.totalVendido / resumen.numeroVentas)
        : 0;
    return {
        resumen: { ...resumen, ticketPromedio },
        serie,
        porMetodoPago,
        porSucursal,
        topProductos,
        porEstado,
    };
}
async function getReporteCompras(input) {
    const f = normalizarFiltros(input);
    const [resumen, serie, porProveedor, porEstado] = await Promise.all([
        repo.findResumenCompras(f),
        repo.findSerieCompras(f),
        repo.findComprasPorProveedor(f),
        repo.findComprasPorEstado(f),
    ]);
    const ticketPromedio = resumen.numeroCompras > 0
        ? redondear(resumen.totalComprado / resumen.numeroCompras)
        : 0;
    return {
        resumen: { ...resumen, ticketPromedio },
        serie,
        porProveedor,
        porEstado,
    };
}
async function getReporteCitas(input) {
    const f = normalizarFiltros(input);
    const [resumen, porEstado, serie] = await Promise.all([
        repo.findResumenCitas(f),
        repo.findCitasPorEstado(f),
        repo.findSerieCitas(f),
    ]);
    const tasaCompletadas = resumen.total > 0
        ? redondear((resumen.completadas / resumen.total) * 100)
        : 0;
    return {
        resumen: { ...resumen, tasaCompletadas },
        porEstado,
        serie,
    };
}
async function getReporteInventario(input) {
    const f = normalizarFiltros(input);
    const [resumen, stockBajo, porSucursal] = await Promise.all([
        repo.findResumenInventario(f),
        repo.findStockBajo(f),
        repo.findInventarioPorSucursal(f),
    ]);
    return { resumen, stockBajo, porSucursal };
}
/** Despacha al reporte solicitado (usado por la exportación). */
async function getReporte(tipo, input) {
    switch (tipo) {
        case 'ventas': return getReporteVentas(input);
        case 'compras': return getReporteCompras(input);
        case 'citas': return getReporteCitas(input);
        case 'inventario': return getReporteInventario(input);
    }
}
//# sourceMappingURL=reportes.service.js.map