const express = require('express');
const docenteController = require('../controllers/docenteController'); // Asegúrate de que la ruta al controlador sea correcta
const router = express.Router();

router.put('/cambiar-rol/:id', docenteController.manejarCambioDeRol);
// Ruta para crear un nuevo usuario
router.post('/', docenteController.crearUsuario);


// router.post('/usuarios', docenteController.crearUsuario);
router.get('/', docenteController.listarUsuarios);
// router.get('/', docenteController.obtenerUsuario);
router.put('/:id', docenteController.actualizarUsuario);
router.delete('/:id', docenteController.eliminarUsuario);
module.exports = router;
