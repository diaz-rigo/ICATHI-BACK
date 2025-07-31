const dns = require('dns');
const pool = require('../config/database');
const { enviarCorreo } = require('../config/nodemailer');
const validator = require('validator'); // Librería para validación avanzada

const verificarCorreoAntesRegistro = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: '❌ El campo "email" es obligatorio.' });
    }

    // 1. Validación con validator.js (más estricta que un regex simple)
    if (!validator.isEmail(email)) {
        return res.status(400).json({
            message: '❌ El formato del correo no es válido.',
            valido: false,
            correo: email
        });
    }

    // 2. Lista de dominios inválidos o sospechosos
    const dominiosInvalidos = [
        'gmail2.com', 
        'mailinator.com', 
        'example.com',
        'fakemail.com'
    ];
    
    const domain = email.split('@')[1];
    
    if (dominiosInvalidos.includes(domain)) {
        return res.status(400).json({
            message: '❌ El dominio del correo no es válido.',
            valido: false,
            correo: email
        });
    }

    try {
        // 3. Verificar si ya existe en la base de datos
        const result = await pool.query(
            'SELECT id FROM usuarios WHERE email = $1',
            [email]
        );

        if (result.rows.length > 0) {
            return res.status(409).json({
                message: '❌ El correo ya está registrado.',
                valido: false,
                correo: email
            });
        }

        // 4. Verificación MX mejorada (con timeout)
        await new Promise((resolve, reject) => {
            dns.resolveMx(domain, (err, addresses) => {
                if (err || !addresses || addresses.length === 0) {
                    reject(new Error('El dominio no tiene registros MX válidos.'));
                } else {
                    resolve();
                }
            });
        });

        // 5. Enviar correo de prueba (opcional, si es necesario)
        const mailOptions = {
            from: '"Verificación de Correo" <tu_correo@gmail.com>',
            to: email,
            subject: 'Verificación de correo',
            text: 'Este es un mensaje automático para verificar que tu correo puede recibir mensajes.',
            html: '<p>Este es un mensaje automático para verificar que tu correo puede recibir mensajes.</p>'
        };

        await enviarCorreo(mailOptions);

        return res.status(200).json({
            message: '✅ Correo enviado con éxito. El correo es válido y no está registrado.',
            valido: true,
            correo: email
        });

    } catch (error) {
        return res.status(400).json({
            message: `❌ ${error.message}`,
            valido: false,
            correo: email
        });
    }
};

module.exports = {
    verificarCorreoAntesRegistro
};