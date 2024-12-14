const express = require('express');
const router = express.Router();
const EspecialidadesController = require('../controllers/especialidadesController');

// Ruta para obtener todas las especialidades
router.get('/', EspecialidadesController.getAll);


// Enpoint que extrae las especialidades por el area seleccionada
router.get('/byAreaId/:areaId', EspecialidadesController.getEspecialidadesByAreaId);


module.exports = router;