const express = require('express');
const router = express.Router();
const especialidadesController = require('../controllers/especialidadesController');

// Ruta para obtener todas las especialidades
router.get('/', especialidadesController.getAll);
router.get('/ByIdPlantel/:idPlantel', especialidadesController.getByIdPlantel);
router.get('/:docente_id', especialidadesController.obtenerEspecialidadesPorDocente);


// router.put('/docentes/:docenteId/especialidades/:especialidadId/validar', especialidadesController.validateEspecialidad);



// Enpoint que extrae las especialidades por el area seleccionada
router.get('/byAreaId/:areaId', especialidadesController.getEspecialidadesByAreaId);


module.exports = router;