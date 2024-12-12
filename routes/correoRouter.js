const express = require('express');
const { enviarCorreoPrueba } = require('../controllers/enviarCorreo'); // Ruta correcta al archivo del controlador

// const CursosController = require('../controllers/cursosController');
const router = express.Router();

// Ruta para probar el envío de correos
router.post('/', enviarCorreoPrueba);

module.exports = router;
