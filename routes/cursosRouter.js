const express = require('express');
const router = express.Router(); // Asegúrate de definir el router aquí
const CursosController = require('../controllers/cursosController');


// Rutas CRUD
router.get('/', CursosController.getAll); // Obtener todos los cursos
router.get('/:id', CursosController.getById); // Obtener un curso por ID
router.post('/', CursosController.create); // Crear un nuevo curso
router.put('/:id', CursosController.update); // Actualizar un curso existente
router.delete('/:id', CursosController.delete); // Eliminar un curso

module.exports = router; // Exporta el router para usarlo en app.js