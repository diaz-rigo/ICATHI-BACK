const validator = require("validator")
const PHONE_CONSTANTS = require("../const/phone-constants")

/**
 * Utilidades para validación de números telefónicos mexicanos
 */
class PhoneValidator {
  /**
   * Limpia un número telefónico removiendo caracteres no numéricos
   * @param {string} phone - Número telefónico a limpiar
   * @returns {string} Número limpio solo con dígitos
   */
  static cleanPhone(phone) {
    if (typeof phone !== "string") {
      return ""
    }
    return phone.replace(/[^\d]/g, "")
  }

  /**
   * Valida el formato básico del teléfono usando validator
   * @param {string} phone - Número telefónico
   * @returns {boolean} True si el formato es válido
   */
  static isValidFormat(phone) {
    return validator.isMobilePhone(phone, "es-MX")
  }

  /**
   * Valida la longitud del número telefónico
   * @param {string} cleanPhone - Número limpio
   * @returns {boolean} True si tiene la longitud correcta
   */
  static isValidLength(cleanPhone) {
    return cleanPhone.length === PHONE_CONSTANTS.MEXICO_PHONE_LENGTH
  }

  /**
   * Valida si el prefijo corresponde a una región válida en México
   * @param {string} cleanPhone - Número limpio
   * @returns {object} Objeto con validez y región
   */
  static validatePrefix(cleanPhone) {
    const prefixes = Object.keys(PHONE_CONSTANTS.VALID_PREFIXES)

    // Verificar prefijos de 3 dígitos primero
    const prefix3 = cleanPhone.substring(0, 3)
    if (prefixes.includes(prefix3)) {
      return {
        isValid: true,
        region: PHONE_CONSTANTS.VALID_PREFIXES[prefix3],
        prefix: prefix3,
      }
    }

    // Verificar prefijos de 2 dígitos
    const prefix2 = cleanPhone.substring(0, 2)
    if (prefixes.includes(prefix2)) {
      return {
        isValid: true,
        region: PHONE_CONSTANTS.VALID_PREFIXES[prefix2],
        prefix: prefix2,
      }
    }

    return {
      isValid: false,
      region: null,
      prefix: null,
    }
  }

  /**
   * Detecta patrones sospechosos en números telefónicos
   * @param {string} cleanPhone - Número limpio
   * @returns {boolean} True si el número es sospechoso
   */
  static isSuspiciousPattern(cleanPhone) {
    // Más de X dígitos repetidos consecutivos
    const repeatedDigitsRegex = new RegExp(`(\\d)\\1{${PHONE_CONSTANTS.MAX_REPEATED_DIGITS},}`)
    if (repeatedDigitsRegex.test(cleanPhone)) {
      return true
    }

    // Secuencias consecutivas ascendentes o descendentes
    const ascendingSequences = ["0123456789", "1234567890", "2345678901", "3456789012"]
    const descendingSequences = ["9876543210", "8765432109", "7654321098", "6543210987"]

    for (const sequence of [...ascendingSequences, ...descendingSequences]) {
      if (sequence.includes(cleanPhone)) {
        return true
      }
    }

    // Mitades idénticas (ej: 5555555555 -> 55555 + 55555)
    const halfLength = Math.floor(cleanPhone.length / 2)
    const firstHalf = cleanPhone.substring(0, halfLength)
    const secondHalf = cleanPhone.substring(halfLength, halfLength * 2)
    if (firstHalf === secondHalf && firstHalf.length >= 4) {
      return true
    }

    // Patrones repetitivos simples (ej: 1212121212)
    const patternRegex = /(\d{2})\1{4}/
    if (patternRegex.test(cleanPhone)) {
      const uniqueDigits = new Set(cleanPhone.split("")).size
      if (uniqueDigits < PHONE_CONSTANTS.MIN_UNIQUE_DIGITS) {
        return true
      }
    }

    // Todos los dígitos iguales
    const uniqueDigitsCount = new Set(cleanPhone.split("")).size
    if (uniqueDigitsCount === 1) {
      return true
    }

    return false
  }

  /**
   * Validación completa de un número telefónico
   * @param {string} phone - Número telefónico original
   * @returns {object} Resultado de la validación
   */
  static validatePhone(phone) {
    // Validación de entrada
    if (!phone || typeof phone !== "string") {
      return {
        isValid: false,
        error: PHONE_CONSTANTS.MESSAGES.REQUIRED,
        code: "REQUIRED",
      }
    }

    // Validación de formato básico
    if (!this.isValidFormat(phone)) {
      return {
        isValid: false,
        error: PHONE_CONSTANTS.MESSAGES.INVALID_FORMAT,
        code: "INVALID_FORMAT",
        originalPhone: phone,
      }
    }

    // Limpiar número
    const cleanPhone = this.cleanPhone(phone)

    // Validación de longitud
    if (!this.isValidLength(cleanPhone)) {
      return {
        isValid: false,
        error: PHONE_CONSTANTS.MESSAGES.INVALID_LENGTH,
        code: "INVALID_LENGTH",
        originalPhone: phone,
        cleanPhone,
      }
    }

    // Validación de prefijo
    const prefixValidation = this.validatePrefix(cleanPhone)
    if (!prefixValidation.isValid) {
      return {
        isValid: false,
        error: PHONE_CONSTANTS.MESSAGES.INVALID_PREFIX,
        code: "INVALID_PREFIX",
        originalPhone: phone,
        cleanPhone,
      }
    }

    // Detección de patrones sospechosos
    if (this.isSuspiciousPattern(cleanPhone)) {
      return {
        isValid: false,
        error: PHONE_CONSTANTS.MESSAGES.SUSPICIOUS_PATTERN,
        code: "SUSPICIOUS_PATTERN",
        originalPhone: phone,
        cleanPhone,
      }
    }

    return {
      isValid: true,
      originalPhone: phone,
      cleanPhone,
      region: prefixValidation.region,
      prefix: prefixValidation.prefix,
    }
  }
}

module.exports = PhoneValidator
