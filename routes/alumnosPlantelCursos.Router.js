const express = require('express');
const AlumnosPlantelCursosController = require('../controllers/AlumnosPlantelCursosController');
const router = express.Router();

router.get('/byIdPlantel/:idPlantel', AlumnosPlantelCursosController.getByIdPlantel); // filtra los ciuroso  por Plantel

module.exports = router;
