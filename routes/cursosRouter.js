const express = require('express');  
const router = express.Router();  
const CursosController = require('../controllers/cursosController');  
const upload = require('../config/upload');

// Rutas CRUD  
router.get('/status/:estatus', CursosController.getByStatus); // Obtener cursos por estatus  
router.get('/', CursosController.getAll); // Obtener todos los cursos  
router.get('/ByIdPlantel/:idPlantel', CursosController.getAllByIdPlantel); // Obtener todos los cursos  
router.get('/:id', CursosController.getById); // Obtener un curso por ID  
router.get('/reporte/:id', CursosController.getByIdInfoReporte); // Obtener un curso por ID  
router.post('/',upload.single('temario'), CursosController.create); // Crear un nuevo curso  

router.put('/:id', CursosController.update); // Actualizar un curso existente  
router.delete('/:id', CursosController.delete); // Eliminar un curso  


router.get('/byIdDocente/:idDocente', CursosController.getAllByIdDocente); // Obtener todos los cursos  

router.get('/cursos/detallados', CursosController.getDetailedCursos);
router.get('/', CursosController.getCursosByAreaIdByEspecialidadId); // Obtener un curso por ID de area y especialida
router.get('/byEspecialidadId/:especialidadId/plantelId/:plantelId', CursosController.getCursosByEspecialidadId);//obtiene cursos por especialidad seleccionada
router.get('/byEspecialidadId/:especialidadId/', CursosController.getCursosByEspecialidadId);//obtiene cursos por especialidad seleccionada
router.patch('/:id/estatus', CursosController.updateStatus);

module.exports = router;