"use strict";

const nodemailer = require('nodemailer');

// Configuración del transporte
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.USER, // Usuario desde las variables de entorno
        pass: process.env.PASSMAIL, // Contraseña desde las variables de entorno
    },
});

// Validación de configuración
transporter.verify((error, success) => {
    if (error) {
        console.error("❌ Error en la configuración del transporte:", error);
    } else {
        console.log("✅ Transporte configurado correctamente y listo para enviar correos.");
    }
});

// Función para enviar correos
const enviarCorreo = async (mailOptions) => {
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`📧 Correo enviado a ${mailOptions.to}. ID: ${info.messageId}`);
    } catch (error) {
        console.error('❌ Error al enviar correo electrónico:', error);
        throw error;
    }
};

// Exportación de módulos
module.exports = {
    transporter,
    enviarCorreo,
};
