const { body, param, validationResult } = require("express-validator")

/**
 * Reglas de validación para emails
 */
const emailValidationRules = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("El email es obligatorio")
      .isEmail()
      .withMessage("El formato del email no es válido")
      .normalizeEmail({
        gmail_remove_dots: false,
        gmail_remove_subaddress: false,
        outlookdotcom_remove_subaddress: false,
        yahoo_remove_subaddress: false,
        icloud_remove_subaddress: false,
      })
      .isLength({ max: 254 })
      .withMessage("El email es demasiado largo"),
  ]
}

/**
 * Reglas de validación para teléfonos
 */
const phoneValidationRules = () => {
  return [
    body("telefono")
      .notEmpty()
      .withMessage("El teléfono es obligatorio")
      .isString()
      .withMessage("El teléfono debe ser una cadena de texto")
      .trim()
      .isLength({ min: 10, max: 15 })
      .withMessage("El teléfono debe tener entre 10 y 15 caracteres"),
  ]
}

/**
 * Reglas de validación para tokens
 */
const tokenValidationRules = () => {
  return [
    param("token")
      .notEmpty()
      .withMessage("El token es obligatorio")
      .isLength({ min: 32, max: 128 })
      .withMessage("El token debe tener entre 32 y 128 caracteres")
      .matches(/^[a-f0-9]+$/i)
      .withMessage("El token debe contener solo caracteres hexadecimales"),
  ]
}

/**
 * Middleware para manejar errores de validación
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "❌ Datos de entrada inválidos",
      errors: errors.array(),
      valido: false,
    })
  }
  next()
}

module.exports = {
  emailValidationRules,
  phoneValidationRules,
  tokenValidationRules,
  handleValidationErrors,
}
