const CursosDocentesController = require('../controllers/cursosDocentesController');
const express = require('express');

const router = express.Router();


router.post('/asignar-curso-docente/', CursosDocentesController.asignarCursoDocente); // asignar curso a docente
router.get('/idDocente/:idDocente', CursosDocentesController.asignarCursoDocente); // asignar curso a docente
router.get('/byIdPlantel/:plantelId/docentes', CursosDocentesController.getAllDocenteByIdPlantel); // asignar curso a docente

// Ruta para obtener alumnos y curso por ID del docente
router.get('/asistencia/:cursoId', CursosDocentesController.getAlumnosAndCursoByIdCursoId);

module.exports = router;
