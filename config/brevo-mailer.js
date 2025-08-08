const SibApiV3Sdk = require("sib-api-v3-sdk")

// Configuración del cliente de Brevo
const defaultClient = SibApiV3Sdk.ApiClient.instance
const apiKey = defaultClient.authentications["api-key"]
apiKey.apiKey = process.env.BREVO_API_KEY

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi()

// Validación de configuración
const verificarConfiguracion = async () => {
  try {
    const accountApi = new SibApiV3Sdk.AccountApi()
    await accountApi.getAccount()
    console.log("✅ Configuración de Brevo correcta y lista para enviar correos.")
    return true
  } catch (error) {
    console.error("❌ Error en la configuración de Brevo:", error)
    return false
  }
}

// Función para enviar correos (mantiene la misma interfaz que nodemailer)
const enviarCorreo = async (mailOptions) => {
  try {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail()

    // Configurar remitente
    if (mailOptions.from) {
      const fromMatch = mailOptions.from.match(/^(.+?)\s*<(.+)>$/) || [null, mailOptions.from, mailOptions.from]
      sendSmtpEmail.sender = {
        name: fromMatch[1] ? fromMatch[1].replace(/"/g, "").trim() : "Remitente",
        email: fromMatch[2] || mailOptions.from,
      }
    } else {
      sendSmtpEmail.sender = {
        name: process.env.SENDER_NAME || "Remitente",
        email: process.env.USER || process.env.SENDER_EMAIL,
      }
    }

    // Configurar destinatarios
    const recipients = []
    if (typeof mailOptions.to === "string") {
      const emails = mailOptions.to.split(",").map((email) => email.trim())
      emails.forEach((email) => {
        const emailMatch = email.match(/^(.+?)\s*<(.+)>$/) || [null, null, email]
        recipients.push({
          email: emailMatch[2] || email,
          name: emailMatch[1] ? emailMatch[1].replace(/"/g, "").trim() : undefined,
        })
      })
    } else if (Array.isArray(mailOptions.to)) {
      mailOptions.to.forEach((email) => {
        if (typeof email === "string") {
          recipients.push({ email })
        } else if (email.email) {
          recipients.push(email)
        }
      })
    }
    sendSmtpEmail.to = recipients

    // Configurar CC si existe
    if (mailOptions.cc) {
      const ccRecipients = []
      const ccEmails =
        typeof mailOptions.cc === "string" ? mailOptions.cc.split(",").map((email) => email.trim()) : mailOptions.cc

      ccEmails.forEach((email) => {
        ccRecipients.push({ email: typeof email === "string" ? email : email.email })
      })
      sendSmtpEmail.cc = ccRecipients
    }

    // Configurar BCC si existe
    if (mailOptions.bcc) {
      const bccRecipients = []
      const bccEmails =
        typeof mailOptions.bcc === "string" ? mailOptions.bcc.split(",").map((email) => email.trim()) : mailOptions.bcc

      bccEmails.forEach((email) => {
        bccRecipients.push({ email: typeof email === "string" ? email : email.email })
      })
      sendSmtpEmail.bcc = bccRecipients
    }

    // Configurar asunto y contenido
    sendSmtpEmail.subject = mailOptions.subject || "Sin asunto"

    if (mailOptions.html) {
      sendSmtpEmail.htmlContent = mailOptions.html
    }
    if (mailOptions.text) {
      sendSmtpEmail.textContent = mailOptions.text
    }

    // Configurar adjuntos si existen
    if (mailOptions.attachments && mailOptions.attachments.length > 0) {
      sendSmtpEmail.attachment = mailOptions.attachments.map((att) => ({
        name: att.filename || att.name,
        content: att.content ? att.content.toString("base64") : undefined,
        url: att.path && !att.content ? att.path : undefined,
      }))
    }

    // Configurar headers personalizados si existen
    if (mailOptions.headers) {
      sendSmtpEmail.headers = mailOptions.headers
    }

    // Enviar el correo
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail)

    console.log(`📧 Correo enviado a ${mailOptions.to}. ID: ${response.messageId}`)

    return {
      success: true,
      response: `250 Message queued as ${response.messageId}`,
      messageId: response.messageId,
      brevoResponse: response,
    }
  } catch (error) {
    console.error("❌ Error al enviar correo electrónico con Brevo:", error)
    throw error
  }
}

// Función adicional para obtener estadísticas
const obtenerEstadisticas = async (messageId) => {
  try {
    const response = await apiInstance.getTransacEmailContent(messageId)
    return response
  } catch (error) {
    console.error("❌ Error al obtener estadísticas:", error)
    throw error
  }
}

// Objeto transporter para mantener compatibilidad
const transporter = {
  verify: async (callback) => {
    try {
      const isValid = await verificarConfiguracion()
      if (callback) {
        callback(isValid ? null : new Error("Configuración inválida"), isValid)
      }
      return isValid
    } catch (error) {
      if (callback) {
        callback(error, false)
      }
      throw error
    }
  },
}

// Inicializar verificación
verificarConfiguracion()

module.exports = {
  transporter,
  enviarCorreo,
  obtenerEstadisticas,
  verificarConfiguracion,
}
