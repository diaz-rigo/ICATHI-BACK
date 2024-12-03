const express = require('express');
const router = express.Router();
const TemariosController = require('../controllers/temariosController');

// Definir las rutas
router.get('/', TemariosController.getAll); // Obtener todos los temarios
router.get('/:id', TemariosController.getById); // Obtener un temario por ID
router.post('/', TemariosController.create); // Crear un nuevo temario
router.put('/:id', TemariosController.update); // Actualizar un temario
router.delete('/:id', TemariosController.delete); // Eliminar un temario

module.exports = router;
