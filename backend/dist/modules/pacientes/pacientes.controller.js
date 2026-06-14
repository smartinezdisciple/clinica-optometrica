"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.list = list;
exports.getById = getById;
exports.create = create;
exports.update = update;
exports.remove = remove;
const pacientes_types_1 = require("./pacientes.types");
const pacientes_service_1 = require("./pacientes.service");
/**
 * GET /api/pacientes
 */
async function list(req, res, next) {
    try {
        const search = typeof req.query.search === 'string' ? req.query.search : undefined;
        const pacientes = await (0, pacientes_service_1.getPacientes)(search);
        res.status(200).json({ ok: true, data: pacientes });
    }
    catch (err) {
        next(err);
    }
}
/**
 * GET /api/pacientes/:id
 */
async function getById(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ ok: false, error: 'ID de paciente inválido' });
            return;
        }
        const paciente = await (0, pacientes_service_1.getPacienteById)(id);
        res.status(200).json({ ok: true, data: paciente });
    }
    catch (err) {
        next(err);
    }
}
/**
 * POST /api/pacientes
 */
async function create(req, res, next) {
    try {
        const dto = pacientes_types_1.PacienteSchema.parse(req.body);
        const paciente = await (0, pacientes_service_1.createPaciente)(dto);
        res.status(201).json({
            ok: true,
            data: paciente,
            mensaje: 'Paciente registrado exitosamente',
        });
    }
    catch (err) {
        next(err);
    }
}
/**
 * PUT /api/pacientes/:id
 */
async function update(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ ok: false, error: 'ID de paciente inválido' });
            return;
        }
        // Partial validation for updates
        const dto = pacientes_types_1.PacienteSchema.partial().parse(req.body);
        const paciente = await (0, pacientes_service_1.updatePaciente)(id, dto);
        res.status(200).json({
            ok: true,
            data: paciente,
            mensaje: 'Paciente actualizado exitosamente',
        });
    }
    catch (err) {
        next(err);
    }
}
/**
 * DELETE /api/pacientes/:id
 */
async function remove(req, res, next) {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ ok: false, error: 'ID de paciente inválido' });
            return;
        }
        await (0, pacientes_service_1.deletePaciente)(id);
        res.status(200).json({
            ok: true,
            mensaje: 'Paciente eliminado exitosamente',
        });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=pacientes.controller.js.map