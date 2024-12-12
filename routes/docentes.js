const express = require('express');
const router = express.Router();
const DocentesController = require('../controllers/docentesController');

// Rutas CRUD
router.get('/', DocentesController.getAll); // Obtener todos los docentes
router.get('/:id', DocentesController.getById); // Obtener un docente por ID
router.post('/', DocentesController.create); // Crear un nuevo docente
router.put('/:id', DocentesController.update); // Actualizar un docente existente
router.delete('/:id', DocentesController.delete); // Eliminar un docente
router.get('/usuario/:userId', DocentesController.getDocentesByUserId);


module.exports = router;