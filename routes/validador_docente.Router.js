const express = require('express');
const router = express.Router();
const especialidadesController = require('../controllers/especialidadesController');



router.put('/docentes/:docenteId/especialidades/:especialidadId/validar', especialidadesController.validateEspecialidad);


module.exports = router;