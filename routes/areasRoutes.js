const express = require('express');
const router = express.Router();
const AreasController = require('../controllers/areasController');

// Ruta para obtener todas las áreas
router.get('/', AreasController.getAll);

module.exports = router;