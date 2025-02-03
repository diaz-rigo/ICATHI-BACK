const CursosDocentesController = require('../controllers/cursosDocentesController');
const express = require('express');

const router = express.Router();
router.post('/asignar-curso-docente/', CursosDocentesController.asignarCursoDocente); // asignar curso a docente
router.post("/asignar-desasignar-curso-docente", CursosDocentesController.asignarODesasignarCursoDocente);


router.get('/idDocente/:idDocente', CursosDocentesController.asignarCursoDocente); // asignar curso a docente
router.get('/byIdPlantel/:plantelId/docentes', CursosDocentesController.getAllDocenteByIdPlantel); // asignar curso a docente

// Ruta para obtener alumnos y curso por ID del docente
router.get('/asistencia/:cursoId', CursosDocentesController.getAlumnosAndCursoByIdCursoId);

// Ruta para obtener un cursos por ID
router.get("/:id", CursosDocentesController.getCursoById);
router.get("/asignados/:docenteId", CursosDocentesController.getAssignedCourses);

router.get("/:cursoId/docentes", CursosDocentesController.getDocentesDeCurso);


module.exports = router;
