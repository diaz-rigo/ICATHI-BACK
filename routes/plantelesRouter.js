const express = require('express');
const router = express.Router();
const plantelesController = require('../controllers/plantelesController.js');

// Definir las rutas
router.get('/', plantelesController.getAll); // Obtener todos los cursos
router.get('/:id', plantelesController.getById); // Obtener un curso por ID
router.post('/', plantelesController.create); // Crear un nuevo curso
router.put('/:id', plantelesController.update); // Actualizar un curso existente
router.delete('/:id', plantelesController.delete); // Eliminar un curso
// router.get('/:id/detalles',plantelesController.getCursoDetailsById)

module.exports = router;
