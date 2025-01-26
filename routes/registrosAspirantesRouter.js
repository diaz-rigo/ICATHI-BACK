// const express = require('express');
// const router = express.Router();
// // const { registrarUsuarioInicial } = require('../controllers/usuarioController'); // Asegúrate de importar la función correctamente
// const registroAspirante_capacitado = require('../controllers/registroAspirante_capacitado.Controller'); // Asegúrate de que la ruta al controlador sea correcta

// router.post('/registro', registroAspirante_capacitado.registrarAspirante);
// module.exports = router;


const express = require('express');
const router = express.Router();
// const { registrarUsuarioInicial } = require('../controllers/usuarioController'); // Asegúrate de importar la función correctamente
const registroAspirante_capacitado = require('../controllers/registroAspirante_capacitado.Controller'); // Asegúrate de que la ruta al controlador sea correcta

router.post('/registro', registroAspirante_capacitado.registrarAspirante);
router.post('/registro/', registroAspirante_capacitado.registrarAspiranteByIdPlantel);

// router.post('/registro', registroAspirante_capacitado.obtenerCurpPorEmail);
router.get('/curp/:email', registroAspirante_capacitado.obtenerCurpPorEmail);

module.exports = router;
