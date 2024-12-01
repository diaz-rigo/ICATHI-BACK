const express = require('express');
const router = express.Router();
const CursosController = require('../controllers/cursosController');

// Definir las rutas
router.get('/', CursosController.getAll); // Obtener todos los cursos
router.get('/:id', CursosController.getById); // Obtener un curso por ID
router.post('/', CursosController.create); // Crear un nuevo curso
router.put('/:id', CursosController.update); // Actualizar un curso existente
router.delete('/:id', CursosController.delete); // Eliminar un curso
router.get('/:id/detalles',CursosController.getCursoDetailsById)

module.exports = router;
