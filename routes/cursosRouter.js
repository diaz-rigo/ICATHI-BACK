const express = require('express');  
const router = express.Router();  
const CursosController = require('../controllers/cursosController');  

// Rutas CRUD  
router.get('/status/:estatus', CursosController.getByStatus); // Obtener cursos por estatus  
router.get('/', CursosController.getAll); // Obtener todos los cursos  
router.get('/:id', CursosController.getById); // Obtener un curso por ID  
router.post('/', CursosController.create); // Crear un nuevo curso  
router.put('/:id', CursosController.update); // Actualizar un curso existente  
router.delete('/:id', CursosController.delete); // Eliminar un curso  



router.get('/', CursosController.getCursosByAreaIdByEspecialidadId); // Obtener un curso por ID de area y especialida
router.get('/byEspecialidadId/:especialidadId/', CursosController.getCursosByEspecialidadId);//obtiene cursos por especialidad seleccionada
module.exports = router;