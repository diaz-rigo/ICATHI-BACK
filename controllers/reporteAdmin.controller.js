// controllers/reporteAdmin.controller.js
const bcrypt = require("bcrypt");
const ReporteAdminModel = require("../models/reporteAdmin.model");

// Nota: asume que tienes un middleware de auth que adjunta req.user con { id, rol }
const saltRounds = 12;

const ReporteAdminController = {
    async listarDocentesRecientes(req, res) {
        try {
            const {
                recentDays = "7",
                    search = "",
                    estatusId = "",
                    limit = "20",
                    offset = "0",
                    orderBy = "d.created_at",
                    orderDir = "DESC",
            } = req.query;

            const result = await ReporteAdminModel.getDocentesRecientes({
                recentDays: parseInt(recentDays, 10),
                search,
                estatusId: estatusId ? parseInt(estatusId, 10) : null,
                limit: parseInt(limit, 10),
                offset: parseInt(offset, 10),
                orderBy,
                orderDir,
            });

            return res.json({
                ok: true,
                ...result,
            });
        } catch (err) {
            console.error("Error listarDocentesRecientes:", err);
            return res.status(500).json({ ok: false, message: "Error interno al listar docentes recientes." });
        }
    },

    async detalleDocente(req, res) {
        try {
            const { id } = req.params;
            const docente = await ReporteAdminModel.getDocentePorId(Number(id));
            if (!docente) return res.status(404).json({ ok: false, message: "Docente no encontrado." });
            return res.json({ ok: true, data: docente });
        } catch (err) {
            console.error("Error detalleDocente:", err);
            return res.status(500).json({ ok: false, message: "Error interno al obtener el detalle del docente." });
        }
    },

    async actualizarEstatusDocente(req, res) {
        try {
            // Verificar rol administrador
            if (!req.user || req.user.rol !== "ADMIN") {
                return res.status(403).json({ ok: false, message: "No autorizado." });
            }

            const { id } = req.params;
            const { estatusId } = req.body;

            if (!estatusId) {
                return res.status(400).json({ ok: false, message: "estatusId es requerido." });
            }

            const actualizado = await ReporteAdminModel.actualizarEstatusDocente(
                Number(id),
                Number(estatusId),
                req.user.id
            );
            if (!actualizado) return res.status(404).json({ ok: false, message: "Docente no encontrado." });

            return res.json({ ok: true, message: "Estatus actualizado.", data: actualizado });
        } catch (err) {
            console.error("Error actualizarEstatusDocente:", err);
            return res.status(500).json({ ok: false, message: "Error interno al actualizar estatus." });
        }
    },

    async cambiarPasswordUsuario(req, res) {
        try {
            // Verificar rol administrador
            if (!req.user || req.user.rol !== "ADMIN") {
                return res.status(403).json({ ok: false, message: "No autorizado." });
            }

            const { usuarioId } = req.params;
            const { nuevoPassword } = req.body;

            if (!nuevoPassword || nuevoPassword.length < 8) {
                return res.status(400).json({
                    ok: false,
                    message: "El nuevo password es requerido y debe tener al menos 8 caracteres.",
                });
            }

            const hash = await bcrypt.hash(nuevoPassword, saltRounds);
            const actualizado = await ReporteAdminModel.actualizarPasswordUsuario(Number(usuarioId), hash);
            if (!actualizado) return res.status(404).json({ ok: false, message: "Usuario no encontrado." });

            return res.json({
                ok: true,
                message: "Password actualizado correctamente.",
                data: actualizado, // no incluye el hash
            });
        } catch (err) {
            console.error("Error cambiarPasswordUsuario:", err);
            return res.status(500).json({ ok: false, message: "Error interno al actualizar el password." });
        }
    },
};

module.exports = ReporteAdminController;