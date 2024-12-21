const express = require('express');
const PlantelesCursosController = require('../controllers/PlantelesCursosController');

const router = express.Router();

// Ruta para registrar una nueva solicitud
router.post('/', PlantelesCursosController.registrarSolicitud);

// Ruta para obtener todas las solicitudes
router.get('/', PlantelesCursosController.obtenerSolicitudes);

// Ruta para actualizar el estatus de una solicitud
router.put('/:id', PlantelesCursosController.actualizarEstatus);

// Ruta para obtener cursos por plantel

// Ruta para eliminar cursos por plantel
router.delete('/byIdPlantel/:idPlantel', PlantelesCursosController.deleteByIdPlantel);

// Nueva ruta para obtener un curso por su ID
router.get('/curso/:idCurso', PlantelesCursosController.obtenerCursoPorId);

// Nueva ruta para obtener planteles con sus cursos
router.get('/plantelesConCursos', PlantelesCursosController.obtenerPlantelesConCursos);

// Nueva ruta para obtener planteles con cursos validados
router.get('/plantelesConCursosValidados', PlantelesCursosController.obtenerPlantelesConCursosValidados);

// Nueva ruta para obtener planteles con cursos no validados
router.get('/plantelesConCursosNoValidados', PlantelesCursosController.obtenerPlantelesConCursosNoValidados);



// ruta para obtener la informacion del curso solicitado(info curso,docentes,alumos)
router.get('/plantelinfo/:idPlantelCurso', PlantelesCursosController.obtenerInfoPlantelCurso);






module.exports = router;