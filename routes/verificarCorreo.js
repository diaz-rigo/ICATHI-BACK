const express = require('express');
const { verificarCorreoAntesRegistro } = require('../config/verificarCorreo'); // Ruta correcta al archivo de verificación

const router = express.Router();

router.post('/', verificarCorreoAntesRegistro);

module.exports = router;
