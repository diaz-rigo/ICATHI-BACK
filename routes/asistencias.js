const express = require('express');
const AsistenciasController = require('../controllers/asistencias.Controller');

const router = express.Router();

router.get('/', AsistenciasController.getAll);
router.get('/:id', AsistenciasController.getById);
router.post('/', AsistenciasController.create);
router.put('/:id', AsistenciasController.update);
router.delete('/:id', AsistenciasController.delete);

module.exports = router;
