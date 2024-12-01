const express = require('express');

const router = express.Router();
const authController = require('../controllers/authController');

// Ruta para crear un nuevo usuario
router.post('/signin', authController.signIn );


// // router.post('/usuarios', usuarioController.crearUsuario);
// router.get('/', usuarioController.obtenerUsuario);
// router.put('/:id', usuarioController.actualizarUsuario);
// router.delete('/:id', usuarioController.eliminarUsuario);
module.exports = router;
