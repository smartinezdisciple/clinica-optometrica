"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = list;
exports.getById = getById;
exports.create = create;
exports.update = update;
exports.patchEstado = patchEstado;
exports.listDisponibilidad = listDisponibilidad;
exports.listHorarios = listHorarios;
exports.addHorario = addHorario;
exports.modifyHorario = modifyHorario;
exports.removeHorario = removeHorario;
const citas_types_1 = require("./citas.types");
const citas_service_1 = require("./citas.service");
const zod_1 = require("zod");
const PatchEstadoSchema = zod_1.z.object({
    estado_cita: zod_1.z.enum(['confirmada', 'cancelada', 'reprogramada', 'en_espera_confirmacion', 'completada']),
});
/**
 * GET /api/citas
 */
async function list(req, res, next) {
    try {
        const filtros = {
            fecha: typeof req.query.fecha === 'string' ? req.query.fecha : undefined,
            estado: typeof req.query.estado === 'string' ? req.query.estado : undefined,
            id_empleado: req.query.id_empleado ? parseInt(req.query.id_empleado, 10) : undefined,
            id_cliente: req.query.id_cliente ? parseInt(req.query.id_cliente, 10) : undefined,
        };
        const citas = await (0, citas_service_1.getCitas)(filtros);
        res.status(200).json({ ok: true, data: citas });
    }
    catch (err) {
        next(err);
    }
}
/**
 * GET /api/citas/:id
 */
async function getById(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ ok: false, error: 'ID de cita inválido' });
            return;
        }
        const cita = await (0, citas_service_1.getCitaById)(id);
        res.status(200).json({ ok: true, data: cita });
    }
    catch (err) {
        next(err);
    }
}
/**
 * POST /api/citas
 */
async function create(req, res, next) {
    try {
        const dto = citas_types_1.CitaSchema.parse(req.body);
        const cita = await (0, citas_service_1.createCita)(dto);
        res.status(201).json({
            ok: true,
            data: cita,
            mensaje: 'Cita reservada exitosamente',
        });
    }
    catch (err) {
        next(err);
    }
}
/**
 * PUT /api/citas/:id
 */
async function update(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ ok: false, error: 'ID de cita inválido' });
            return;
        }
        const dto = citas_types_1.CitaSchema.partial().parse(req.body);
        const cita = await (0, citas_service_1.updateCita)(id, dto);
        res.status(200).json({
            ok: true,
            data: cita,
            mensaje: 'Cita actualizada exitosamente',
        });
    }
    catch (err) {
        next(err);
    }
}
/**
 * PATCH /api/citas/:id/estado
 */
async function patchEstado(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ ok: false, error: 'ID de cita inválido' });
            return;
        }
        const { estado_cita } = PatchEstadoSchema.parse(req.body);
        const cita = await (0, citas_service_1.changeCitaEstado)(id, estado_cita);
        res.status(200).json({
            ok: true,
            data: cita,
            mensaje: `Cita marcada como ${estado_cita} exitosamente`,
        });
    }
    catch (err) {
        next(err);
    }
}
/**
 * GET /api/citas/disponibilidad
 */
async function listDisponibilidad(req, res, next) {
    try {
        const idEmpleado = parseInt(req.query.id_empleado, 10);
        const fecha = req.query.fecha; // YYYY-MM-DD
        if (isNaN(idEmpleado) || !fecha) {
            res.status(400).json({ ok: false, error: 'id_empleado y fecha son obligatorios' });
            return;
        }
        const slots = await (0, citas_service_1.getDisponibilidad)(idEmpleado, fecha);
        res.status(200).json({ ok: true, data: slots });
    }
    catch (err) {
        next(err);
    }
}
// ─── Horarios ────────────────────────────────────────────────────────────────
/**
 * GET /api/horarios
 */
async function listHorarios(req, res, next) {
    try {
        const idEmpleado = req.query.id_empleado ? parseInt(req.query.id_empleado, 10) : undefined;
        const horarios = await (0, citas_service_1.getHorarios)(idEmpleado);
        res.status(200).json({ ok: true, data: horarios });
    }
    catch (err) {
        next(err);
    }
}
/**
 * POST /api/horarios
 */
async function addHorario(req, res, next) {
    try {
        const dto = citas_types_1.HorarioSchema.parse(req.body);
        const horario = await (0, citas_service_1.createHorario)(dto);
        res.status(201).json({
            ok: true,
            data: horario,
            mensaje: 'Horario configurado exitosamente',
        });
    }
    catch (err) {
        next(err);
    }
}
/**
 * PUT /api/horarios/:id
 */
async function modifyHorario(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ ok: false, error: 'ID de horario inválido' });
            return;
        }
        const dto = citas_types_1.HorarioSchema.partial().parse(req.body);
        await (0, citas_service_1.updateHorario)(id, dto);
        res.status(200).json({
            ok: true,
            mensaje: 'Horario actualizado exitosamente',
        });
    }
    catch (err) {
        next(err);
    }
}
/**
 * DELETE /api/horarios/:id
 */
async function removeHorario(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ ok: false, error: 'ID de horario inválido' });
            return;
        }
        await (0, citas_service_1.deleteHorario)(id);
        res.status(200).json({
            ok: true,
            mensaje: 'Horario eliminado exitosamente',
        });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=citas.controller.js.map