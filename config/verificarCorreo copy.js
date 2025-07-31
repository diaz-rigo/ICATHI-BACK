const dns = require("dns");
const pool = require("../config/database");
const { enviarCorreo } = require("../config/nodemailer");
const validator = require("validator");
var validators = require("email-validator");

const verificarCorreoAntesRegistro = async (req, res) => {
  const { email } = req.body;
  const emailRegex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "❌ El formato del correo no es válido (regex).",
      valido: false,
      correo: email,
    });
  }

  if (!email) {
    return res
      .status(400)
      .json({ message: '❌ El campo "email" es obligatorio.' });
  }

  // 1. Validación estricta del formato
  if (
    !validator.isEmail(email, {
      domain_specific_validation: true,
      allow_utf8_local_part: false,
      blacklisted_chars: '()<>,;:\\"[]',
    })
  ) {
    return res.status(400).json({
      message: "❌ El formato del correo no es válido.",
      valido: false,
      correo: email,
    });
  }

  // 2. Extraer dominio y usuario
  const [username, domain] = email.split("@");
  const domainLower = domain.toLowerCase();

  // 3. Lista de dominios inválidos o temporales
  const dominiosInvalidos = [
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
  ];

  console.log("validator.validate(email)", validators.validate(email));
  if (dominiosInvalidos.includes(domainLower)) {
    return res.status(400).json({
      message: `❌ El dominio del correo (${domain}) no es válido.`,
      valido: false,
      correo: email,
    });
  }

  try {
    // 5. Verificar en base de datos
    const result = await pool.query(
      "SELECT id FROM usuarios WHERE email = $1",
      [email]
    );

    if (result.rows.length > 0) {
      return res.status(409).json({
        message: "❌ El correo ya está registrado.",
        valido: false,
        correo: email,
      });
    }

    // 6. Verificación MX y DNS
    const [mxRecords, ipAddress] = await Promise.all([
      dns.promises.resolveMx(domainLower),
      dns.promises.resolve4(domainLower).catch(() => null),
    ]);

    if (!mxRecords || mxRecords.length === 0) {
      throw new Error(`No se encontraron registros MX para ${domainLower}`);
    }

    if (!ipAddress) {
      throw new Error(`No se pudo resolver la IP del dominio ${domainLower}`);
    }

    // 7. Verificación SMTP (simulación)
    const esValido = await verificarExistenciaSMTP(email);
    if (!esValido) {
      return res.status(400).json({
        message: "❌ El correo no parece existir en el servidor de destino.",
        valido: false,
        correo: email,
      });
    }

    // 8. Enviar correo de verificación
    try {
      const mailOptions = {
        from: '"ICATHI" <icathi.edu@gmail.com>',
        to: email,
        subject: "Verificación de correo",
        text: "Por favor confirma tu correo electrónico",
        html: "<p>Por favor confirma tu correo electrónico</p>",
        headers: {
          "Disposition-Notification-To": "icathi.edu@gmail.com",
        },
      };

      const info = await enviarCorreo(mailOptions);
      //   debug

      return res.status(200).json({
        message:
          "✅ Correo enviado. Por favor verifica tu bandeja de entrada para completar el registro.",
        valido: true,
        correo: email,
        infoEnvio: info,
      });
    } catch (error) {
      return res.status(400).json({
        message: `❌ Error al enviar el correo de verificación: ${error.message}`,
        valido: false,
        correo: email,
      });
    }
  } catch (error) {
    return res.status(400).json({
      message: `❌ Error en la verificación: ${info}`,
      valido: false,
      correo: email,
    });
  }
};

async function verificarExistenciaSMTP(email) {
  const [username, domain] = email.split("@");
  const domainLower = domain.toLowerCase();

  // Reglas para Gmail
  if (domainLower === "gmail.com") {
    if (username.length < 6 || username.length > 30) return false;
    if (!/^[a-z0-9.]+$/.test(username.toLowerCase())) return false;

    // Patrones ajustados para Gmail
    const gmailSuspiciousPatterns = [
      /(\w)\1{5,}/, // 6+ caracteres repetidos
      /\d{8,}/, // 8+ dígitos consecutivos
      /^[a-z0-9]{20,}$/i, // Usernames muy largos sin puntos
      /(?:[a-z]{3}\d{3}){3,}/i, // Patrones repetitivos
    ];

    return !gmailSuspiciousPatterns.some((p) => p.test(username));
  }

  // Reglas generales más flexibles para otros dominios
  if (username.length > 50) return false;

  // Lista blanca para nombres comerciales comunes
  const businessKeywords = [
    "zapateria",
    "restaurante",
    "tienda",
    "comercial",
    "ventas",
    "servicios",
    "consultoria",
  ];

  if (businessKeywords.some((kw) => username.toLowerCase().includes(kw))) {
    return true;
  }

  //   // Detección de patrones sospechosos genéricos
  //   const genericSuspiciousPatterns = [
  //     /(\w)\1{6,}/, // 7+ caracteres repetidos
  //     /\d{10,}/, // 10+ dígitos
  //     /(?:[a-z]{3}\d{3}){4,}/i, // Secuencias repetitivas
  //     /^[a-f0-9]{32}$/i, // Hashes MD5
  //   ];
  const genericSuspiciousPatterns = [
    // Patrones de repetición
    /(\w)\1{6,}/, // 7+ caracteres repetidos
    /(\w{3})\1{3,}/, // Secuencias de 3 caracteres repetidas 4+ veces
    /\d{10,}/, // 10+ dígitos consecutivos

    // Patrones de secuencias
    /(?:[a-z]{3}\d{3}){4,}/i, // Secuencias alfanuméricas repetitivas
    /(abc|def|ghi|jkl|mno|pqr|stu|vwx|yz){3,}/i, // Secuencias de teclado

    // Hashes comunes
    /^[a-f0-9]{32}$/i, // MD5
    /^[a-f0-9]{40}$/i, // SHA-1
    /^[a-f0-9]{64}$/i, // SHA-256

    // Patrones de codificación
    /%[0-9a-f]{2}/i, // Caracteres URL-encoded
    /&\w+;/, // Entidades HTML

    // Patrones de IPs y URLs
    /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, // Direcciones IP
    /(http|ftp|https):\/\/[^\s]+/, // URLs

    // Caracteres sospechosos
    /[<>\[\]{}|\\^~]/, // Caracteres especiales potencialmente peligrosos
  ];

  return !genericSuspiciousPatterns.some((p) => p.test(username));
}
module.exports = {
  verificarCorreoAntesRegistro,
};
