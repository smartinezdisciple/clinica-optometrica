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
exports.getEmpresas = getEmpresas;
exports.getEmpresaById = getEmpresaById;
exports.createEmpresa = createEmpresa;
exports.updateEmpresa = updateEmpresa;
exports.deleteEmpresa = deleteEmpresa;
const repo = __importStar(require("./empresas.repository"));
/**
 * Obtiene el listado de todas las empresas o filtra por búsqueda.
 */
async function getEmpresas(search) {
    return repo.findEmpresas(search);
}
/**
 * Obtiene los detalles de una empresa por su ID.
 */
async function getEmpresaById(id) {
    const empresa = await repo.findEmpresaById(id);
    if (!empresa) {
        const err = new Error('Empresa no encontrada');
        err.statusCode = 404;
        throw err;
    }
    return empresa;
}
/**
 * Registra una nueva empresa en el sistema.
 */
async function createEmpresa(dto) {
    // Validar unicidad del RUC
    const existeRuc = await repo.findEmpresaByRuc(dto.ruc.trim());
    if (existeRuc) {
        const err = new Error('El RUC ingresado ya está registrado para otra empresa');
        err.statusCode = 400;
        throw err;
    }
    // Validar cédula si se proporciona
    if (dto.cedula && dto.cedula.trim()) {
        const existeCedula = await repo.findEmpresaByRuc(dto.cedula.trim()); // check against customers
        if (existeCedula) {
            const err = new Error('La cédula/documento ingresado ya está registrado');
            err.statusCode = 400;
            throw err;
        }
    }
    const id = await repo.insertEmpresaTransaccion(dto);
    const nuevaEmpresa = await repo.findEmpresaById(id);
    if (!nuevaEmpresa) {
        const err = new Error('Error al recuperar la empresa creada');
        err.statusCode = 500;
        throw err;
    }
    return nuevaEmpresa;
}
/**
 * Actualiza los datos de una empresa existente.
 */
async function updateEmpresa(id, dto) {
    const actual = await repo.findEmpresaById(id);
    if (!actual) {
        const err = new Error('Empresa no encontrada');
        err.statusCode = 404;
        throw err;
    }
    // Validar RUC si cambia
    if (dto.ruc && dto.ruc.trim() && dto.ruc.trim() !== actual.ruc) {
        const existeRuc = await repo.findEmpresaByRuc(dto.ruc.trim());
        if (existeRuc) {
            const err = new Error('El RUC ingresado ya está registrado para otra empresa');
            err.statusCode = 400;
            throw err;
        }
    }
    await repo.updateEmpresaTransaccion(id, dto);
    const actualizada = await repo.findEmpresaById(id);
    if (!actualizada) {
        const err = new Error('Error al recuperar la empresa actualizada');
        err.statusCode = 500;
        throw err;
    }
    return actualizada;
}
/**
 * Elimina una empresa del sistema.
 */
async function deleteEmpresa(id) {
    const actual = await repo.findEmpresaById(id);
    if (!actual) {
        const err = new Error('Empresa no encontrada');
        err.statusCode = 404;
        throw err;
    }
    await repo.deleteEmpresaRepo(id);
}
//# sourceMappingURL=empresas.service.js.map