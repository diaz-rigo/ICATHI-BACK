const express = require('express');
const AlumnosPlantelCursosController = require('../controllers/AlumnosPlantelCursosController');
const router = express.Router();

router.get('/byIdPlantel/:idPlantel/alumnos', AlumnosPlantelCursosController.getByIdPlantel); // filtra los ciuroso  por Plantel
router.get('/byIdPlantel/:idPlantel/info', AlumnosPlantelCursosController.getInfoByIdPlantel); // filtra los ciuroso  por Plantel

module.exports = router;
