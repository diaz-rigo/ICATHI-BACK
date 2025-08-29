// controllers/solicitudesCursos.controller.js
const Solicitudes = require('../models/solicitudesCursos.model');

function ok(res, data, status = 200) {
    return res.status(status).json({ ok: true, data });
}

function fail(res, error, status = 400) {
    return res.status(status).json({ ok: false, error: error.message || String(error) });
}

exports.create = async(req, res) => {
    try {
        const { cursoId, docenteId, prioridad, justificacion } = req.body;
        const data = await Solicitudes.create({ cursoId, docenteId, prioridad, justificacion });
        return ok(res, data, 201);
    } catch (e) {
        return fail(res, e);
    }
};

exports.getOne = async(req, res) => {
    try {
        const data = await Solicitudes.findById(req.params.id);
        if (!data) return fail(res, new Error('No encontrado'), 404);
        return ok(res, data);
    } catch (e) {
        return fail(res, e);
    }
};

exports.list = async(req, res) => {
    try {
        const { docenteId, estado, cursoId, prioridad, search, page, pageSize } = req.query;
        const data = await Solicitudes.list({
            docenteId,
            estado,
            cursoId,
            prioridad,
            search,
            page,
            pageSize,
        });
        return ok(res, data);
    } catch (e) {
        return fail(res, e);
    }
};

exports.update = async(req, res) => {
    try {
        const { prioridad, justificacion } = req.body;
        const data = await Solicitudes.update(req.params.id, { prioridad, justificacion });
        if (!data) return fail(res, new Error('No encontrado'), 404);
        return ok(res, data);
    } catch (e) {
        return fail(res, e);
    }
};

exports.updateEstado = async(req, res) => {
    try {
        const { estado, respuestaMensaje, evaluadorId } = req.body;
        const data = await Solicitudes.updateEstado(req.params.id, { estado, respuestaMensaje, evaluadorId });
        if (!data) return fail(res, new Error('No encontrado'), 404);
        return ok(res, data);
    } catch (e) {
        return fail(res, e);
    }
};

exports.aprobarYAsignar = async(req, res) => {
    try {
        const { evaluadorId, respuestaMensaje, approveAndAssign, paramsAsignacion } = req.body;
        const data = await Solicitudes.aprobarYAsignar(
            req.params.id, { evaluadorId, respuestaMensaje, approveAndAssign, paramsAsignacion }
        );
        return ok(res, data);
    } catch (e) {
        return fail(res, e);
    }
};

exports.remove = async(req, res) => {
    try {
        const data = await Solicitudes.remove(req.params.id);
        return ok(res, data);
    } catch (e) {
        return fail(res, e);
    }
};