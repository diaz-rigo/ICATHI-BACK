const PhoneService = require("../services/phone-service")

/**
 * Controlador para operaciones relacionadas con teléfonos
 */
class PhoneController {
  /**
   * Verifica un teléfono antes del registro
   * @param {object} req - Request object
   * @param {object} res - Response object
   */
  static async verificarTelefonoAntesRegistro(req, res) {
    try {
      const { telefono } = req.body

      // Validación básica de entrada
      if (!telefono) {
        return res.status(400).json({
          success: false,
          message: '❌ El campo "teléfono" es obligatorio.',
          data: {
            valido: false,
          },
        })
      }

      // Procesar verificación
      const result = await PhoneService.verifyPhoneForRegistration(telefono)

      // Determinar código de estado HTTP
      let statusCode = 200
      if (!result.success) {
        switch (result.code) {
          case "ALREADY_EXISTS":
            statusCode = 409 // Conflict
            break
          case "SERVER_ERROR":
            statusCode = 500 // Internal Server Error
            break
          default:
            statusCode = 400 // Bad Request
        }
      }

      return res.status(statusCode).json({
        success: result.success,
        message: result.message,
        ...result.data,
      })
    } catch (error) {
      console.error("Error in verificarTelefonoAntesRegistro controller:", error)
      return res.status(500).json({
        success: false,
        message: "❌ Error interno del servidor.",
        valido: false,
        telefono: req.body.telefono || null,
      })
    }
  }
}

module.exports = PhoneController
