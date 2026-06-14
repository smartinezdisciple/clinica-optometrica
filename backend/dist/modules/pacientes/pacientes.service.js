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
exports.getPacientes = getPacientes;
exports.getPacienteById = getPacienteById;
exports.createPaciente = createPaciente;
exports.updatePaciente = updatePaciente;
exports.deletePaciente = deletePaciente;
const repo = __importStar(require("./pacientes.repository"));
/**
 * Obtiene todos los pacientes o filtra según una búsqueda de texto.
 */
async function getPacientes(search) {
    return repo.findPacientes(search);
}
/**
 * Obtiene un paciente por su ID.
 */
async function getPacienteById(id) {
    const paciente = await repo.findPacienteById(id);
    if (!paciente) {
        const err = new Error('Paciente no encontrado');
        err.statusCode = 404;
        throw err;
    }
    return paciente;
}
/**
 * Registra un nuevo paciente en el sistema.
 */
async function createPaciente(dto) {
    // Validar cédula única si se proporciona
    if (dto.cedula && dto.cedula.trim()) {
        const existe = await repo.findClienteByCedula(dto.cedula.trim());
        if (existe) {
            const err = new Error('La cédula ingresada ya está registrada en el sistema');
            err.statusCode = 400;
            throw err;
        }
    }
    const id = await repo.insertPacienteTransaccion(dto);
    const nuevoPaciente = await repo.findPacienteById(id);
    if (!nuevoPaciente) {
        const err = new Error('Error al recuperar el paciente creado');
        err.statusCode = 500;
        throw err;
    }
    return nuevoPaciente;
}
/**
 * Actualiza los datos de un paciente existente.
 */
async function updatePaciente(id, dto) {
    const actual = await repo.findPacienteById(id);
    if (!actual) {
        const err = new Error('Paciente no encontrado');
        err.statusCode = 404;
        throw err;
    }
    // Validar cédula única si se modifica
    if (dto.cedula && dto.cedula.trim() && dto.cedula.trim() !== actual.cedula) {
        const existe = await repo.findClienteByCedula(dto.cedula.trim());
        if (existe) {
            const err = new Error('La cédula ingresada ya está registrada por otro cliente');
            err.statusCode = 400;
            throw err;
        }
    }
    await repo.updatePacienteTransaccion(id, dto);
    const actualizado = await repo.findPacienteById(id);
    if (!actualizado) {
        const err = new Error('Error al recuperar el paciente actualizado');
        err.statusCode = 500;
        throw err;
    }
    return actualizado;
}
/**
 * Elimina un paciente por su ID.
 */
async function deletePaciente(id) {
    const actual = await repo.findPacienteById(id);
    if (!actual) {
        const err = new Error('Paciente no encontrado');
        err.statusCode = 404;
        throw err;
    }
    await repo.deletePacienteRepo(id);
}
//# sourceMappingURL=pacientes.service.js.map