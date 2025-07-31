const validator = require("validator");
const dns = require("dns");
const EMAIL_CONSTANTS = require("../const/email-constants");

/**
 * Utilidades para validación de correos electrónicos
 */
class EmailValidator {
  /**
   * Valida el formato básico del email usando regex personalizado
   * @param {string} email - Correo electrónico
   * @returns {boolean} True si el formato es válido
   */
  static isValidFormatRegex(email) {
    return EMAIL_CONSTANTS.EMAIL_REGEX.test(email);
  }

  /**
   * Valida el formato del email usando validator.js
   * @param {string} email - Correo electrónico
   * @returns {boolean} True si el formato es válido
   */
  static isValidFormatStrict(email) {
    return validator.isEmail(email, EMAIL_CONSTANTS.VALIDATION_CONFIG);
  }

  /**
   * Extrae el username y dominio del email
   * @param {string} email - Correo electrónico
   * @returns {object} Objeto con username y domain
   */
  static parseEmail(email) {
    const [username, domain] = email.split("@");
    return {
      username: username || "",
      domain: (domain || "").toLowerCase(),
    };
  }

  /**
   * Verifica si el dominio está en la lista de dominios inválidos
   * @param {string} domain - Dominio a verificar
   * @returns {boolean} True si el dominio es inválido
   */
  static isInvalidDomain(domain) {
    return EMAIL_CONSTANTS.INVALID_DOMAINS.includes(domain.toLowerCase());
  }

  /**
   * Verifica registros MX y DNS del dominio
   * @param {string} domain - Dominio a verificar
   * @returns {Promise<object>} Resultado de la verificación
   */
  static async verifyDNSRecords(domain) {
    const [mxRecords, ipAddress] = await Promise.all([
      dns.promises.resolveMx(domain),
      dns.promises.resolve4(domain).catch(() => null),
    ]);

    if (!mxRecords || mxRecords.length === 0) {
      throw new Error(`${EMAIL_CONSTANTS.MESSAGES.MX_NOT_FOUND} ${domain}`);
    }

    if (!ipAddress) {
      throw new Error(`${EMAIL_CONSTANTS.MESSAGES.IP_NOT_RESOLVED} ${domain}`);
    }

    return { mxRecords, ipAddress };
  }

  /**
   * Verifica si el username contiene palabras clave de negocio
   * @param {string} username - Username a verificar
   * @returns {boolean} True si contiene palabras de negocio
   */
  static hasBusinessKeywords(username) {
    const usernameLower = username.toLowerCase();
    return EMAIL_CONSTANTS.BUSINESS_KEYWORDS.some((keyword) =>
      usernameLower.includes(keyword)
    );
  }

  /**
   * Verificación SMTP simulada (mantiene la lógica original)
   * @param {string} email - Email a verificar
   * @returns {Promise<boolean>} True si el email parece válido
   */
  static async verificarExistenciaSMTP(email) {
    const { username, domain } = this.parseEmail(email);

    // Reglas para Gmail
    if (domain === "gmail.com") {
      if (
        username.length < EMAIL_CONSTANTS.MIN_GMAIL_USERNAME ||
        username.length > EMAIL_CONSTANTS.MAX_GMAIL_USERNAME
      ) {
        return false;
      }

      if (!/^[a-z0-9.]+$/.test(username.toLowerCase())) {
        return false;
      }

      return !EMAIL_CONSTANTS.SUSPICIOUS_PATTERNS.GMAIL.some((pattern) =>
        pattern.test(username)
      );
    }

    // Reglas generales más flexibles para otros dominios
    if (username.length > EMAIL_CONSTANTS.MAX_USERNAME_LENGTH) {
      return false;
    }

    // Lista blanca para nombres comerciales comunes
    if (this.hasBusinessKeywords(username)) {
      return true;
    }

    // Detección de patrones sospechosos genéricos
    return !(
      EMAIL_CONSTANTS.SUSPICIOUS_PATTERNS.GENERIC &&
      EMAIL_CONSTANTS.SUSPICIOUS_PATTERNS.GENERIC.some((pattern) =>
        pattern.test(username)
      )
    );
  }
}

module.exports = EmailValidator;
