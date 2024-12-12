const express = require('express');
const router = express.Router();
const alumnoController = require('../controllers/alumnoController');

router.get('/', alumnoController.getAll);
router.get('/:id', alumnoController.getById);
router.post('/', alumnoController.create);
router.put('/:id', alumnoController.update); 
router.delete('/:id', alumnoController.delete);

module.exports = router;