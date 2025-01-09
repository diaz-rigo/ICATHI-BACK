const express = require('express');
const usuarioController = require('../controllers/usuarioController'); // Asegúrate de que la ruta al controlador sea correcta
const router = express.Router();
router.put('/:id/estatus-rol', usuarioController.manejarCambioDeEstatusYRol);

router.put('/cambiar-rol/:id', usuarioController.manejarCambioDeRol);
// Ruta para crear un nuevo usuario
router.post('/', usuarioController.crearUsuario);


// router.post('/usuarios', usuarioController.crearUsuario);
router.get('/', usuarioController.listarUsuarios);
// router.get('/', usuarioController.obtenerUsuario);
router.put('/:id', usuarioController.actualizarUsuario);
router.delete('/:id', usuarioController.eliminarUsuario);
module.exports = router;
