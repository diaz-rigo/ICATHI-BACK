// routes/solicitudesCursos.routes.js
const { Router } = require('express');
const ctrl = require('../controllers/solicitudesCursos.controller');

const router = Router();

/** Crear solicitud (componente 1) */
router.post('/', ctrl.create);

/** Listar (componente 2) — con filtros por query */
router.get('/', ctrl.list);

/** Obtener detalle */
router.get('/:id', ctrl.getOne);

/** Actualizar (prioridad/justificación) */
router.patch('/:id', ctrl.update);

/** Cambiar estado (Pendiente/En Revisión/Aprobado/Rechazado) */
router.patch('/:id/estado',
    ctrl.updateEstado);

/** Aprobar y (opcional) asignar en cursos_docentes */
router.post('/:id/aprobar', ctrl.aprobarYAsignar);

/** Eliminar */
router.delete('/:id', ctrl.remove);

module.exports = router;