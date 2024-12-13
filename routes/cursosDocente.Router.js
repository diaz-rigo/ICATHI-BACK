const CursosDocentesController = require('../controllers/cursosDocentesController');
const express = require('express');

const router = express.Router();


router.post('/asignar-curso-docente/', CursosDocentesController.asignarCursoDocente); // asignar curso a docente



module.exports = router;
