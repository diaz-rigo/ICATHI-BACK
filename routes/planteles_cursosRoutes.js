const express = require('express');
const AlumnosPlantelCursosController = require('../controllers/AlumnosPlantelCursosController');

const PlantelesCursosController = require('../controllers/PlantelesCursosController');
const upload = require('../config/upload');

const router = express.Router();
// Ruta para registrar una nueva solicitud, que recibe un archivo 'temario'
router.post('/',PlantelesCursosController.registrarSolicitud); 
// router.post('/', upload.single('temario'),PlantelesCursosController.registrarSolicitud); // 'temario' es el nombre del campo en el formulario

// // Ruta para registrar una nueva solicitud
// router.post('/', PlantelesCursosController.registrarSolicitud);

// Ruta para obtener todas las solicitudes
router.get('/', PlantelesCursosController.obtenerSolicitudes);
router.get('/alumnos/:id', PlantelesCursosController.getAlumnos);

// Ruta para actualizar el estatus de una solicitud
router.put('/:id', PlantelesCursosController.actualizarEstatus);

router.get('/info/:idPlantel', PlantelesCursosController.getInfo); // filtra los ciuroso  por Plantel
router.get('/byIdPlantel/:idPlantel', PlantelesCursosController.getByIdPlantel); // filtra los ciuroso solicitdados por Plantel
router.delete('/byIdPlantel/:idPlantel', PlantelesCursosController.deleteByIdPlantel); // filtra los ciuroso  por Plantel
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
router.get('/', PlantelesCursosController.getAll);



// ruta para obtener la informacion del curso solicitado(info curso,docentes,alumos)
router.get('/plantelinfo/:idPlantelCurso', PlantelesCursosController.obtenerInfoPlantelCurso);
// router.get('/plantelinfo/:idPlantelCurso', PlantelesCursosController.obtenerInfoPlantelCurso);
router.get('/plantelinfoDetalle/:idPlantelCurso', PlantelesCursosController.obtenerDetalleCursosPorPlantel);
router.get('/cursosYestatus/:idPlantel', PlantelesCursosController.getCursosConEstado);



router.put('/:alumnoId/cursos/:cursoId', AlumnosPlantelCursosController.actualizarCalificacionFinal); 


// Ruta para actualizar la solicitud   por ID
router.put("/solicitud/:id", PlantelesCursosController.updateCourse_solicitud_ById);



module.exports = router;