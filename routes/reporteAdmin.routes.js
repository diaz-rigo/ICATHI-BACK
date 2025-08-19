// routes/reporteAdmin.routes.js
const { Router } = require("express");
const ReporteAdminController = require("../controllers/reporteAdmin.controller");

const router = Router();

// Middleware de autenticación/autorizaición sugeridos
// const requireAuth = require("../middlewares/requireAuth");
// const requireAdmin = require("../middlewares/requireAdmin");


/**
 * GET /api/admin/reportes/docentes
 * Parámetros (query):
 *  - recentDays: int (default 7)
 *  - search: string
 *  - estatusId: int
 *  - limit: int (default 20)
 *  - offset: int (default 0)
 *  - orderBy: 'd.created_at' | 'd.updated_at' | 'd.nombre' | 'd.apellidos' | 'u.username' | 'd.estatus_id'
 *  - orderDir: 'ASC' | 'DESC'
 */
router.get(
    "/docentes",
    // requireAuth, requireAdmin,
    ReporteAdminController.listarDocentesRecientes
);

/**
 * GET /api/admin/reportes/docentes/:id
 * Detalle de un docente
 */
router.get(
    "/docentes/:id",
    // requireAuth, requireAdmin,
    ReporteAdminController.detalleDocente
);

/**
 * PATCH /api/admin/reportes/docentes/:id/estatus
 * Body: { estatusId: number }
 */
router.patch(
    "/docentes/:id/estatus",
    // requireAuth, requireAdmin,
    ReporteAdminController.actualizarEstatusDocente
);

/**
 * PATCH /api/admin/usuarios/:usuarioId/password
 * Body: { nuevoPassword: string }
 */
router.patch(
    "/usuarios/:usuarioId/password",
    // requireAuth, requireAdmin,
    ReporteAdminController.cambiarPasswordUsuario
);

module.exports = router;