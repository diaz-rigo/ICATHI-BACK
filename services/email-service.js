const pool = require("../config/database")
// const { enviarCorreo } = require("../config/nodemailer")
const { enviarCorreo, transporter } = require("../config/brevo-mailer")
const EmailValidator = require("../utils/email-validator")
const EMAIL_CONSTANTS = require("../const/email-constants")

/**
 * Servicio para manejo de operaciones relacionadas con emails
 */
class EmailService {
  /**
   * Verifica si un email ya existe en la base de datos
   * @param {string} email - Email a verificar
   * @returns {Promise<boolean>} True si el email ya existe
   */
  static async emailExists(email) {
    const result = await pool.query("SELECT id FROM usuarios WHERE email = $1", [email])
    return result.rows.length > 0
  }

  /**
   * Envía correo de verificación
   * @param {string} email - Email destinatario
   * @returns {Promise<object>} Información del envío
   */
  static async sendVerificationEmail(email) {
    const mailOptions = {
      from: EMAIL_CONSTANTS.MAIL_CONFIG.from,
      to: email,
      subject: EMAIL_CONSTANTS.MAIL_CONFIG.subject,
      text: EMAIL_CONSTANTS.MAIL_CONFIG.text,
      html: EMAIL_CONSTANTS.MAIL_CONFIG.html,
      headers: EMAIL_CONSTANTS.MAIL_CONFIG.headers,
    }

    return await enviarCorreo(mailOptions)
  }

  /**
   * Verifica un email antes del registro (lógica completa original)
   * @param {string} email - Email a verificar
   * @returns {Promise<object>} Resultado de la verificación
   */
  static async verifyEmailForRegistration(email) {
    try {
      // 1. Validación de formato con regex
      if (!EmailValidator.isValidFormatRegex(email)) {
        return {
          success: false,
          status: 400,
          message: EMAIL_CONSTANTS.MESSAGES.INVALID_FORMAT_REGEX,
          valido: false,
          correo: email,
        }
      }

      // 2. Validación estricta del formato
      if (!EmailValidator.isValidFormatStrict(email)) {
        return {
          success: false,
          status: 400,
          message: EMAIL_CONSTANTS.MESSAGES.INVALID_FORMAT,
          valido: false,
          correo: email,
        }
      }

      // 3. Extraer dominio y usuario
      const { username, domain } = EmailValidator.parseEmail(email)

      // 4. Verificar dominios inválidos
      if (EmailValidator.isInvalidDomain(domain)) {
        return {
          success: false,
          status: 400,
          message: `${EMAIL_CONSTANTS.MESSAGES.INVALID_DOMAIN} (${domain}) no es válido.`,
          valido: false,
          correo: email,
        }
      }

      // 5. Verificar en base de datos
      const exists = await this.emailExists(email)
      if (exists) {
        return {
          success: false,
          status: 409,
          message: EMAIL_CONSTANTS.MESSAGES.ALREADY_EXISTS,
          valido: false,
          correo: email,
        }
      }

      // 6. Verificación MX y DNS
      await EmailValidator.verifyDNSRecords(domain)

      // 7. Verificación SMTP (simulación)
      const esValido = await EmailValidator.verificarExistenciaSMTP(email)
      if (!esValido) {
        return {
          success: false,
          status: 400,
          message: EMAIL_CONSTANTS.MESSAGES.SMTP_VERIFICATION_FAILED,
          valido: false,
          correo: email,
        }
      }

      // 8. Enviar correo de verificación
      try {
        const info = await this.sendVerificationEmail(email)

        return {
          success: true,
          status: 200,
          message: EMAIL_CONSTANTS.MESSAGES.EMAIL_SENT,
          valido: true,
          correo: email,
          infoEnvio: info,
        }
      } catch (emailError) {
        return {
          success: false,
          status: 400,
          message: `${EMAIL_CONSTANTS.MESSAGES.EMAIL_SEND_ERROR} ${emailError.message}`,
          valido: false,
          correo: email,
        }
      }
    } catch (error) {
      console.error("Error in email verification service:", error)
      return {
        success: false,
        status: 400,
        message: `${EMAIL_CONSTANTS.MESSAGES.VERIFICATION_ERROR} ${error.message}`,
        valido: false,
        correo: email,
      }
    }
  }
}

module.exports = EmailService
