const express = require('express');
const AlumnosPlantelCursosController = require('../controllers/AlumnosPlantelCursosController');

const PlantelesCursosController = require('../controllers/PlantelesCursosController');
const upload = require('../config/upload');

const router = express.Router();
// Ruta para registrar una nueva solicitud, que recibe un archivo 'temario'
router.post('/', upload.single('temario'),PlantelesCursosController.registrarSolicitud); // 'temario' es el nombre del campo en el formulario

// // Ruta para registrar una nueva solicitud
// router.post('/', PlantelesCursosController.registrarSolicitud);

// Ruta para obtener todas las solicitudes
router.get('/', PlantelesCursosController.obtenerSolicitudes);

// Ruta para actualizar el estatus de una solicitud
router.put('/:id', PlantelesCursosController.actualizarEstatus);

router.get('/byIdPlantel/:idPlantel', PlantelesCursosController.getByIdPlantel); // filtra los ciuroso  por Plantel
router.delete('/byIdPlantel/:idPlantel', PlantelesCursosController.deleteByIdPlantel); // filtra los ciuroso  por Plantel
// Ruta para obtener cursos por plantel

// Nueva ruta para obtener planteles con sus cursos
router.get('/plantelesConCursos', PlantelesCursosController.obtenerPlantelesConCursos);

// Nueva ruta para obtener planteles con cursos validados
router.get('/plantelesConCursosValidados', PlantelesCursosController.obtenerPlantelesConCursosValidados);

// Nueva ruta para obtener planteles con cursos no validados
router.get('/plantelesConCursosNoValidados', PlantelesCursosController.obtenerPlantelesConCursosNoValidados);



// ruta para obtener la informacion del curso solicitado(info curso,docentes,alumos)
router.get('/plantelinfo/:idPlantelCurso', PlantelesCursosController.obtenerInfoPlantelCurso);



router.put('/:alumnoId/cursos/:cursoId', AlumnosPlantelCursosController.actualizarCalificacionFinal); 






module.exports = router;