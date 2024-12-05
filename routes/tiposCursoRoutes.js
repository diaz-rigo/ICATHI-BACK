const express = require('express');
const router = express.Router();
const TiposCursoController = require('../controllers/tiposCursoController');

// Ruta para obtener todos los tipos de curso
router.get('/', TiposCursoController.getAll);

module.exports = router;