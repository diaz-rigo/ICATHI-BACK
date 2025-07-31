// Constantes para validación de correos electrónicos
const EMAIL_CONSTANTS = {
  // Límites de longitud
  MAX_USERNAME_LENGTH: 50,
  MIN_GMAIL_USERNAME: 6,
  MAX_GMAIL_USERNAME: 30,

  // Dominios temporales y no válidos
  INVALID_DOMAINS: [
    "mailinator.com",
    "example.com",
    "fakemail.com",
    "tempmail.com",
    "10minutemail.com",
    "guerrillamail.com",
    "yopmail.com",
    "trashmail.com",
    "dispostable.com",
    "maildrop.cc",
  ],

  // Palabras clave para correos comerciales legítimos
  BUSINESS_KEYWORDS: [
    "zapateria",
    "restaurante",
    "tienda",
    "comercial",
    "ventas",
    "servicios",
    "consultoria",
  ],

  // // Patrones sospechosos para Gmail
  // GMAIL_SUSPICIOUS_PATTERNS: [
  //   /(\w)\1{5,}/, // 6+ caracteres repetidos
  //   /\d{8,}/, // 8+ dígitos consecutivos
  //   /^[a-z0-9]{20,}$/i, // Usernames muy largos sin puntos
  //   /(?:[a-z]{3}\d{3}){3,}/i, // Patrones repetitivos
  // ],

  // // Patrones sospechosos genéricos
  // GENERIC_SUSPICIOUS_PATTERNS: [
  //   // Patrones de repetición
  //   /(\w)\1{6,}/, // 7+ caracteres repetidos
  //   /(\w{3})\1{3,}/, // Secuencias de 3 caracteres repetidas 4+ veces
  //   /\d{10,}/, // 10+ dígitos consecutivos
  //   // Patrones de secuencias
  //   /(?:[a-z]{3}\d{3}){4,}/i, // Secuencias alfanuméricas repetitivas
  //   /(abc|def|ghi|jkl|mno|pqr|stu|vwx|yz){3,}/i, // Secuencias de teclado
  //   // Hashes comunes
  //   /^[a-f0-9]{32}$/i, // MD5
  //   /^[a-f0-9]{40}$/i, // SHA-1
  //   /^[a-f0-9]{64}$/i, // SHA-256
  //   // Patrones de codificación
  //   /%[0-9a-f]{2}/i, // Caracteres URL-encoded
  //   /&\w+;/, // Entidades HTML
  //   // Patrones de IPs y URLs
  //   /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, // Direcciones IP
  //   /(http|ftp|https):\/\/[^\s]+/, // URLs
  //   // Caracteres sospechosos
  //   /[<>[\]{}|\\^~]/, // Caracteres especiales potencialmente peligrosos
  // ],

  SUSPICIOUS_PATTERNS: {
    GMAIL: [
      /(\w)\1{5,}/, // 6+ caracteres repetidos
      /\d{8,}/, // 8+ dígitos consecutivos
      /^[a-z0-9]{20,}$/i, // Usernames muy largos sin puntos
      /(?:[a-z]{3}\d{3}){3,}/i, // Patrones repetitivos
    ],
    GENERIC: [
      /(\w)\1{6,}/, // 7+ caracteres repetidos
      /(\w{3})\1{3,}/, // Secuencias de 3 caracteres repetidas 4+ veces
      /\d{10,}/, // 10+ dígitos consecutivos
      /(?:[a-z]{3}\d{3}){4,}/i, // Secuencias alfanuméricas repetitivas
      /(abc|def|ghi|jkl|mno|pqr|stu|vwx|yz){3,}/i, // Secuencias de teclado
      /^[a-f0-9]{32}$/i, // MD5
      /^[a-f0-9]{40}$/i, // SHA-1
      /^[a-f0-9]{64}$/i, // SHA-256
      /%[0-9a-f]{2}/i, // Caracteres URL-encoded
      /&\w+;/, // Entidades HTML
      /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, // Direcciones IP
      /(http|ftp|https):\/\/[^\s]+/, // URLs
      /[<>[\]{}|\\^~]/, // Caracteres especiales
    ],
  },

  // Configuración de validación
  VALIDATION_CONFIG: {
    domain_specific_validation: true,
    allow_utf8_local_part: false,
    blacklisted_chars: '()<>,;:\\"[]',
  },

  // Regex para validación de formato
  EMAIL_REGEX:
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,

  // Mensajes de respuesta
  MESSAGES: {
    REQUIRED: '❌ El campo "email" es obligatorio.',
    INVALID_FORMAT_REGEX: "❌ El formato del correo no es válido (regex).",
    INVALID_FORMAT: "❌ El formato del correo no es válido.",
    INVALID_DOMAIN: "❌ El dominio del correo no es válido.",
    ALREADY_EXISTS: "❌ El correo ya está registrado.",
    MX_NOT_FOUND: "No se encontraron registros MX para",
    IP_NOT_RESOLVED: "No se pudo resolver la IP del dominio",
    SMTP_VERIFICATION_FAILED:
      "❌ El correo no parece existir en el servidor de destino.",
    EMAIL_SENT:
      "✅ Correo enviado. Por favor verifica tu bandeja de entrada para completar el registro.",
    EMAIL_SEND_ERROR: "❌ Error al enviar el correo de verificación:",
    VERIFICATION_ERROR: "❌ Error en la verificación:",
  },

  // Configuración de correo
  MAIL_CONFIG: {
    from: '"ICATHI" <icathi.edu@gmail.com>',
    subject: "Verificación de correo",
    text: "Por favor confirma tu correo electrónico",
    html: "<p>Por favor confirma tu correo electrónico</p>",
    headers: {
      "Disposition-Notification-To": "icathi.edu@gmail.com",
    },
  },
};

module.exports = EMAIL_CONSTANTS;
