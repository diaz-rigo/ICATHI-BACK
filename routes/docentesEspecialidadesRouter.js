const express = require('express');
const router = express.Router();
const docentesEspecialidadesController = require('../controllers/docentesEspecialidadesController');

// Ruta para actualizar el estatus de una especialidad
router.get('/especialidad/:especialidadId', docentesEspecialidadesController.obtenerDocentesPorEspecialidadHandler);
router.put('/actualizar-estatus', docentesEspecialidadesController.actualizarEstatus);

module.exports = router;
