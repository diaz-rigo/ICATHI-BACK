const { enviarCorreo } = require('../config/nodemailer'); // Asegúrate de usar la ruta correcta a tu archivo Nodemailer

const enviarCorreoPrueba = async (req, res) => {
    const { to, subject, text, html } = req.body; // Los datos del correo se reciben en el cuerpo de la solicitud

    if (!to || !subject || (!text && !html)) {
        return res.status(400).json({
            message: '❌ Faltan campos necesarios (to, subject, text o html).',
        });
    }

    const mailOptions = {
        from: '"Tu Nombre o Empresa" <tu_correo@gmail.com>', // Cambia esto por tu correo
        to, // Dirección del destinatario
        subject, // Asunto del correo
        text, // Contenido en texto plano
        html, // Contenido en HTML (opcional)
    };

    try {
        await enviarCorreo(mailOptions);
        res.status(200).json({
            message: '📧 Correo enviado con éxito.',
            to,
        });
    } catch (error) {
        res.status(500).json({
            message: '❌ Error al enviar el correo.',
            error: error.message,
        });
    }
};

module.exports = {
    enviarCorreoPrueba,
};
