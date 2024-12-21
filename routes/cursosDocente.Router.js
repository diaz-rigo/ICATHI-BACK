const CursosDocentesController = require('../controllers/cursosDocentesController');
const express = require('express');

const router = express.Router();


router.post('/asignar-curso-docente/', CursosDocentesController.asignarCursoDocente); // asignar curso a docente
router.get('/idDocente/:idDocente', CursosDocentesController.asignarCursoDocente); // asignar curso a docente

// router.get('/alumno&cursos/:docenteId', CursosDocentesController.getAlumnosAndcursoByIdDocente);



module.exports = router;
