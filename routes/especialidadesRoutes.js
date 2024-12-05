const express = require('express');
const router = express.Router();
const EspecialidadesController = require('../controllers/especialidadesController');

// Ruta para obtener todas las especialidades
router.get('/', EspecialidadesController.getAll);

module.exports = router;