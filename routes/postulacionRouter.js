    const express = require('express');
    const router = express.Router();
    // const { registrarUsuarioInicial } = require('../controllers/usuarioController'); // Asegúrate de importar la función correctamente
    const postulacionController = require('../controllers/postulacionController'); // Asegúrate de que la ruta al controlador sea correcta
    
    router.post('/registro', postulacionController.registrarUsuarioInicial);
    router.post('/crear-password', postulacionController.crearPassword);
    router.post('/crear-password-admin', postulacionController.crearPasswordAdmin);
    // Ruta para registrar un usuario
    router.get('/validar-correo', postulacionController.validarCorreo); // Cambiar de POST a GET

module.exports = router;
