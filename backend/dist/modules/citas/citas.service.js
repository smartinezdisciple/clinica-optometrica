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
exports.getCitas = getCitas;
exports.getCitaById = getCitaById;
exports.createCita = createCita;
exports.updateCita = updateCita;
exports.changeCitaEstado = changeCitaEstado;
exports.getHorarios = getHorarios;
exports.createHorario = createHorario;
exports.updateHorario = updateHorario;
exports.deleteHorario = deleteHorario;
exports.getDisponibilidad = getDisponibilidad;
const repo = __importStar(require("./citas.repository"));
/**
 * Obtiene la lista de citas filtrada.
 */
async function getCitas(filtros) {
    return repo.findCitas(filtros);
}
/**
 * Obtiene una cita por su ID.
 */
async function getCitaById(id) {
    const cita = await repo.findCitaById(id);
    if (!cita) {
        const err = new Error('La cita no existe');
        err.statusCode = 404;
        throw err;
    }
    return cita;
}
/**
 * Registra una nueva cita verificando disponibilidad y colisiones.
 */
async function createCita(dto) {
    // Si se asigna un optometrista, validar disponibilidad
    if (dto.id_empleado) {
        await validarHorarioYColisiones(dto.id_empleado, dto.fecha_hora_cita);
    }
    const id = await repo.insertCita(dto);
    const nuevaCita = await repo.findCitaById(id);
    if (!nuevaCita) {
        const err = new Error('Error al recuperar la cita creada');
        err.statusCode = 500;
        throw err;
    }
    return nuevaCita;
}
/**
 * Actualiza los datos de una cita.
 */
async function updateCita(id, dto) {
    const actual = await repo.findCitaById(id);
    if (!actual) {
        const err = new Error('La cita no existe');
        err.statusCode = 404;
        throw err;
    }
    const fechaHora = dto.fecha_hora_cita || actual.fecha_hora_cita;
    const empleadoId = dto.id_empleado !== undefined ? dto.id_empleado : actual.id_empleado;
    // Si cambia de fecha/hora u optometrista, y hay uno asignado, validar disponibilidad
    if (empleadoId &&
        (fechaHora !== actual.fecha_hora_cita || empleadoId !== actual.id_empleado)) {
        await validarHorarioYColisiones(empleadoId, fechaHora, id);
    }
    await repo.updateCita(id, dto);
    const actualizada = await repo.findCitaById(id);
    if (!actualizada) {
        const err = new Error('Error al recuperar la cita actualizada');
        err.statusCode = 500;
        throw err;
    }
    return actualizada;
}
/**
 * Cambia el estado de una cita.
 */
async function changeCitaEstado(id, estado) {
    const actual = await repo.findCitaById(id);
    if (!actual) {
        const err = new Error('La cita no existe');
        err.statusCode = 404;
        throw err;
    }
    await repo.updateCitaEstado(id, estado);
    const actualizada = await repo.findCitaById(id);
    if (!actualizada) {
        const err = new Error('Error al recuperar la cita modificada');
        err.statusCode = 500;
        throw err;
    }
    return actualizada;
}
/**
 * Obtiene los horarios configurados.
 */
async function getHorarios(idEmpleado) {
    return repo.findHorarios(idEmpleado);
}
/**
 * Crea un horario de atención para un optometrista.
 */
async function createHorario(dto) {
    const id = await repo.insertHorario(dto);
    const horarios = await repo.findHorarios(dto.id_empleado);
    const nuevo = horarios.find((h) => h.id_horario === id);
    if (!nuevo) {
        const err = new Error('Error al recuperar el horario creado');
        err.statusCode = 500;
        throw err;
    }
    return nuevo;
}
/**
 * Modifica un bloque horario.
 */
async function updateHorario(id, dto) {
    await repo.updateHorario(id, dto);
}
/**
 * Elimina un horario.
 */
async function deleteHorario(id) {
    await repo.deleteHorarioRepo(id);
}
/**
 * Consulta la disponibilidad de horarios de un optometrista para una fecha específica.
 * Genera slots de 30 minutos y los cruza con las citas ya reservadas.
 */
async function getDisponibilidad(idEmpleado, fecha) {
    // 1. Determinar el día de la semana (1-Lunes, 7-Domingo)
    const dateObj = new Date(fecha + 'T00:00:00');
    const jsDay = dateObj.getDay();
    const dbDiaSemana = jsDay === 0 ? 7 : jsDay;
    // 2. Obtener los bloques de horarios_disponibles de ese día
    const horarios = await repo.findHorarios(idEmpleado);
    const bloquesActivos = horarios.filter((h) => h.activo && h.dia_semana === dbDiaSemana);
    if (bloquesActivos.length === 0) {
        return []; // No trabaja este día
    }
    // 3. Obtener citas agendadas para este día
    const citasDelDia = await repo.findCitas({ fecha, id_empleado: idEmpleado });
    const horasOcupadas = citasDelDia
        .filter((c) => ['confirmada', 'reprogramada', 'en_espera_confirmacion'].includes(c.estado_cita))
        .map((c) => {
        // Extrae la hora en formato HH:MM desde la fecha_hora_cita (Date u objeto)
        const date = new Date(c.fecha_hora_cita);
        const h = String(date.getHours()).padStart(2, '0');
        const m = String(date.getMinutes()).padStart(2, '0');
        return `${h}:${m}`;
    });
    // 4. Generar slots de 30 minutos dentro de cada bloque de trabajo
    const slots = [];
    for (const bloque of bloquesActivos) {
        const [hInicio, mInicio] = bloque.hora_inicio.split(':').map(Number);
        const [hFin, mFin] = bloque.hora_fin.split(':').map(Number);
        let actualMinutos = hInicio * 60 + mInicio;
        const limiteMinutos = hFin * 60 + mFin;
        while (actualMinutos < limiteMinutos) {
            const h = String(Math.floor(actualMinutos / 60)).padStart(2, '0');
            const m = String(actualMinutos % 60).padStart(2, '0');
            const horaStr = `${h}:${m}`;
            const ocupado = horasOcupadas.includes(horaStr);
            slots.push({
                hora: horaStr,
                disponible: !ocupado,
            });
            actualMinutos += 30; // incrementos de 30 min
        }
    }
    return slots;
}
// ─── Utilidades internas de validación ────────────────────────────────────────
async function validarHorarioYColisiones(idEmpleado, fechaHoraCita, excluirIdCita) {
    const dateObj = new Date(fechaHoraCita);
    if (isNaN(dateObj.getTime())) {
        const err = new Error('Fecha y hora de cita inválida');
        err.statusCode = 400;
        throw err;
    }
    // Validar que no sea una fecha pasada
    if (dateObj.getTime() < Date.now()) {
        const err = new Error('No se pueden programar citas en el pasado');
        err.statusCode = 400;
        throw err;
    }
    // 1. Validar que la hora esté en el bloque de atención (horarios_disponibles)
    const jsDay = dateObj.getDay();
    const dbDiaSemana = jsDay === 0 ? 7 : jsDay;
    const horaStr = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}:00`;
    const horariosValidos = await repo.findHorariosPorDiaYHora(idEmpleado, dbDiaSemana, horaStr);
    if (horariosValidos.length === 0) {
        const err = new Error('El optometrista no atiende en el horario seleccionado');
        err.statusCode = 400;
        throw err;
    }
    // 2. Validar que no colisione con otra cita
    // Convertimos a string ISO de Postgres
    const pgTimestamp = dateObj.toISOString().replace('T', ' ').substring(0, 19);
    const colisiones = await repo.findCitasConflicto(idEmpleado, pgTimestamp, excluirIdCita);
    if (colisiones.length > 0) {
        const err = new Error('El optometrista ya tiene otra cita agendada a esa hora');
        err.statusCode = 400;
        throw err;
    }
}
//# sourceMappingURL=citas.service.js.map