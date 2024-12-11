const express = require('express');
const PlantelesCursosController = require('../controllers/PlantelesCursosController');

const router = express.Router();

// Ruta para registrar una nueva solicitud
router.post('/', PlantelesCursosController.registrarSolicitud);

// Ruta para obtener todas las solicitudes
router.get('/', PlantelesCursosController.obtenerSolicitudes);

// Ruta para actualizar el estatus de una solicitud
router.put('/:id', PlantelesCursosController.actualizarEstatus);

module.exports = router;
