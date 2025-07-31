const pool = require("../config/database")
const PhoneValidator = require("../utils/phone-validator")
const PHONE_CONSTANTS = require("../const/phone-constants")

/**
 * Servicio para manejo de operaciones relacionadas con teléfonos
 */
class PhoneService {
  /**
   * Verifica si un teléfono ya existe en la base de datos
   * @param {string} cleanPhone - Número telefónico limpio
   * @returns {Promise<boolean>} True si el teléfono ya existe
   */
  static async phoneExists(cleanPhone) {
    try {
      const result = await pool.query("SELECT id FROM usuarios WHERE telefono = $1 LIMIT 1", [cleanPhone])
      return result.rows.length > 0
    } catch (error) {
      console.error("Error checking phone existence:", error)
      throw new Error("Error al verificar la existencia del teléfono en la base de datos")
    }
  }

  /**
   * Verifica un teléfono antes del registro
   * @param {string} phone - Número telefónico a verificar
   * @returns {Promise<object>} Resultado de la verificación
   */
  static async verifyPhoneForRegistration(phone) {
    try {
      // Validación del formato y estructura
      const validation = PhoneValidator.validatePhone(phone)

      if (!validation.isValid) {
        return {
          success: false,
          message: validation.error,
          code: validation.code,
          data: {
            valido: false,
            telefono: phone,
            telefonoLimpio: validation.cleanPhone || null,
          },
        }
      }

      // Verificar si el teléfono ya existe
      const exists = await this.phoneExists(validation.cleanPhone)

      if (exists) {
        return {
          success: false,
          message: PHONE_CONSTANTS.MESSAGES.ALREADY_EXISTS,
          code: "ALREADY_EXISTS",
          data: {
            valido: false,
            telefono: phone,
            telefonoLimpio: validation.cleanPhone,
          },
        }
      }

      // Teléfono válido y disponible
      return {
        success: true,
        message: PHONE_CONSTANTS.MESSAGES.VALID_AVAILABLE,
        code: "VALID_AVAILABLE",
        data: {
          valido: true,
          telefono: phone,
          telefonoLimpio: validation.cleanPhone,
          region: validation.region,
          prefijo: validation.prefix,
        },
      }
    } catch (error) {
      console.error("Error in phone verification service:", error)
      return {
        success: false,
        message: `${PHONE_CONSTANTS.MESSAGES.SERVER_ERROR}: ${error.message}`,
        code: "SERVER_ERROR",
        data: {
          valido: false,
          telefono: phone,
        },
      }
    }
  }
}

module.exports = PhoneService
