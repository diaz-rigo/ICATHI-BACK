const express = require('express');
const router = express.Router();
const DocentesController = require('../controllers/docentesController');
const especialidadesController = require('../controllers/especialidadesController');

// Rutas CRUD
router.get('/alumnoANDcursos/:docenteId', DocentesController.getAlumnosAndcursoByIdDocente);
router.get('/obtieneDocentes/', especialidadesController.getSearchDocente);
router.put('/:id', DocentesController.update); // Actualizar un docente existente
router.get('/', DocentesController.getAll); // Obtener todos los docentes
router.get('/:id', DocentesController.getById); // Obtener un docente por ID
router.post('/', DocentesController.create); // Crear un nuevo docente
router.delete('/:id', DocentesController.delete); // Eliminar un docente
router.get('/usuario/:userId', DocentesController.getDocentesByUserId);


// Nueva ruta para actualizar el estatus de un docente
router.put('/:docenteId/estatus', DocentesController.updateDocenteStatus); // Actualizar estatus de un docente

router.post('/:id/cambiar-password', DocentesController.cambiarPasswordPerfil);

// funciones
router.post('/:docenteId/especialidades', especialidadesController.associateEspecialidades);

module.exports = router;