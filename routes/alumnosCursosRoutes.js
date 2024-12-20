const express = require('express');
const router = express.Router();
const alumnosCursosController = require('../controllers/alumnosCursosController');

// Ruta para obtener todos los registros de un alumno
router.get('/:alumnoId', alumnosCursosController.getAllByAlumno);

// Ruta para obtener detalles de un curso específico
router.get('/:alumnoId/curso/:cursoId', alumnosCursosController.getByAlumnoAndCurso);

// // Ruta para crear un nuevo registro
// router.post('/', alumnosCursosController.create);

// Ruta para actualizar un registro
router.put('/:id', alumnosCursosController.update);

// // Ruta para eliminar un registro
// router.delete('/:id', alumnosCursosController.delete);

module.exports = router;
