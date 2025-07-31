const EmailService = require("../services/email-service")
const EMAIL_CONSTANTS = require("../const/email-constants")

/**
 * Controlador para operaciones relacionadas con emails
 */
class EmailController {
  /**
   * Verifica un email antes del registro
   * @param {object} req - Request object
   * @param {object} res - Response object
   */
  static async verificarCorreoAntesRegistro(req, res) {
    try {
      const { email } = req.body

      // Validación básica de entrada
      if (!email) {
        return res.status(400).json({
          message: EMAIL_CONSTANTS.MESSAGES.REQUIRED,
          valido: false,
        })
      }

      // Procesar verificación
      const result = await EmailService.verifyEmailForRegistration(email)

      // Asegurar que siempre tengamos un status válido
      const statusCode = result.status || (result.success ? 200 : 400)

      // Responder con el resultado
      return res.status(statusCode).json({
        message: result.message,
        valido: result.valido,
        correo: result.correo,
        ...(result.infoEnvio && { infoEnvio: result.infoEnvio }),
      })
    } catch (error) {
      console.error("Error in verificarCorreoAntesRegistro controller:", error)
      return res.status(500).json({
        message: "❌ Error interno del servidor.",
        valido: false,
        correo: req.body.email || null,
      })
    }
  }
}

module.exports = EmailController
