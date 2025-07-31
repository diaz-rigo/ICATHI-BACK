const express = require('express');
const { verificarCorreoAntesRegistro } = require('../config/verificarCorreo'); 
const PhoneController = require("../config/verificarTel")
const {
  emailValidationRules,
  phoneValidationRules,
  handleValidationErrors,
} = require("../config/validation-middleware")
const router = express.Router();

router.post('/', emailValidationRules(), handleValidationErrors,verificarCorreoAntesRegistro);
router.post("/telefono",phoneValidationRules(), PhoneController.verificarTelefonoAntesRegistro)


module.exports = router;
