const express = require('express');
const AlumnosPlantelCursosController = require('../controllers/AlumnosPlantelCursosController');
const router = express.Router();

router.get('/byIdPlantel/:idPlantel/alumnos', AlumnosPlantelCursosController.getByIdPlantel); // filtra los ciuroso  por Plantel
router.get('/byIdPlantel/:idPlantel/info', AlumnosPlantelCursosController.getInfoByIdPlantel); // filtra los ciuroso  por Plantel


router.put('/:alumnoId/cursos/:cursoId', AlumnosPlantelCursosController.actualizarCalificacionFinal); 
router.get('/:alumnoId/oferta-educativa', AlumnosPlantelCursosController.getCursosDePlantelPorIdAlumno);

// Ruta para obtener alumnos por plantel y curso
router.get("/alumnos/:plantelId/:cursoId", AlumnosPlantelCursosController.obtenerAlumnos);

module.exports = router;
