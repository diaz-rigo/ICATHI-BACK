const express = require('express');
const app = express();
require('dotenv').config(); // Carga variables de entorno
const morgan = require('morgan');
const cursosRouter = require('./routes/cursosRouter'); // Importa las rutas
const pool = require('./config/database'); // Importa el pool de conexión

// Middleware de logging
app.use(morgan('dev'));

// Middleware para parsear JSON
app.use(express.json());

// Configuración de CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
    return res.status(200).json({});
  }
  next();
});

// Servir archivos estáticos desde 'uploads'
app.use('/uploads', express.static('uploads'));

// Ruta para los cursos
app.use('/cursos', cursosRouter); // Asigna el router de cursos

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
