
const express = require('express');
const cors = require("cors");
const app = express();
require('dotenv').config(); // Carga variables de entorno
const morgan = require('morgan');
const cursosRouter = require('./routes/cursosRouter'); // Importa las rutas
const usuarioRoutes = require('./routes/usuarioRoutes'); // Asegúrate de que la ruta al archivo de rutas sea correcta
const auth = require('./routes/authRoutes'); // Asegúrate de que la ruta al archivo de rutas sea correcta
const temariosRouter = require('./routes/temariosRouter');
const plantelRouter = require('./routes/plantelesRouter');
const areasRoutes = require('./routes/areasRoutes');
const especialidadesRoutes = require('./routes/especialidadesRoutes');
const tipos_curso = require ('./routes/tiposCursoRoutes')
const docentes = require ('./routes/docentes')
const plantelesRouter = require ('./routes/planteles_cursosRoutes')
const plantelesCursosRouter = require ('./routes/planteles_cursosRoutes')
const cursosDocente = require ('./routes/cursosDocente.Router')
const alumnosPlantelCursosRouter = require ('./routes/alumnosPlantelCursos.Router')

const correoRoutes = require ('./routes/correoRouter')
const postulacion = require ('./routes/postulacionRouter')
const alumno = require ('./routes/alumnoRouter')

const aspirante= require ('./routes/registrosAspirantesRouter')
const archivos= require ('./routes/archivos.Router')
const especialidades_docentes= require ('./routes/docentesEspecialidadesRouter')
const alumnos_cursos= require ('./routes/alumnosCursosRoutes')
const asistencias_alumnos= require ('./routes/asistencias')
const verificarCorreoRouter= require ('./routes/verificarCorreo')

// const pool = require('./config/database'); // Importa el pool de conexión

// Middleware de logging
app.use(morgan('dev'));

// Middleware para parsear JSON
app.use(express.json());


const allowedOrigins = [
  "https://icathi.vercel.app",
  "http://localhost:4200",
  "http://201.116.27.119:4200"
];


app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
// Permitir preflight requests (OPTIONS)
app.options("*", cors());


// Servir archivos estáticos desde 'uploads'
app.use('/uploads', express.static('uploads'));

// Ruta para los cursos
app.use('/cursos', cursosRouter); // Asigna el router de cursos
app.use('/user', usuarioRoutes); // Asigna el router de cursos
app.use('/auth', auth); // Asigna el router de cursos
app.use('/temarios', temariosRouter);
app.use('/plantel', plantelRouter);
app.use('/areas', areasRoutes);
app.use('/especialidades', especialidadesRoutes);
app.use('/tiposCurso', tipos_curso);
app.use('/docentes', docentes)
app.use('/enviar-correo', correoRoutes);
app.use('/postulacion', postulacion);
app.use('/alumno', alumno);
app.use('/planteles-curso', plantelesCursosRouter);
app.use('/curso-docente', cursosDocente);
app.use('/planteles', plantelesRouter);
app.use('/aspirante', aspirante);
app.use('/PlantelCursos', alumnosPlantelCursosRouter);
app.use('/plantelesCursos', plantelesCursosRouter); // Asegúrate de que la ruta
app.use('/archivos', archivos);
app.use('/especialidades_docentes', especialidades_docentes);
app.use('/alumnos-cursos', alumnos_cursos);
app.use('/asistencias_alumnos', asistencias_alumnos);
app.use('/verificar-correo', verificarCorreoRouter);
// Middleware para manejar errores de rutas no encontradas
app.use((req, res, next) => {
  const error = new Error('Recurso no encontrado');
  error.status = 404;
  next(error);
});

// Middleware de manejo de errores
app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    error: {
      message: error.message,
    },
  });
});

// Exporta la aplicación
module.exports = app;
