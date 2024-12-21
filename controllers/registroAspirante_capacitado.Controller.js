const { enviarCorreo } = require('../config/nodemailer'); // Importa la función para enviar correos
const crypto = require('crypto'); // Para generar un token aleatorio de validación
const pool = require('../config/database'); // Importa la configuración del pool de conexiones
const bcrypt = require('bcrypt');


exports.registrarAspirante = async (req, res) => {
    const { area, curp, curso, email, especialidad, name, plantel, telefono } = req.body;
console.log(req.body)
    // Validar que se hayan proporcionado todos los campos requeridos
    if (!name || !curp || !email || !telefono || !curso || !plantel) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const nombres = name.trim().split(' ');
    const primerNombre = nombres.shift();
    const apellidos = nombres.join(' ');

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(curp, saltRounds);
    const client = await pool.connect();
    const username = `${primerNombre.toLowerCase()}_${apellidos.toLowerCase()}`.substring(0, 15);

    try {
        await client.query('BEGIN');

        // Paso 1: Verificar si la CURP ya existe
        const existingAlumno = await client.query(`
            SELECT id FROM alumnos WHERE num_documento_identificacion = $1
        `, [curp]);

        if (existingAlumno.rows.length > 0) {
            return res.status(409).json({ error: 'Ya existe un registro con esta CURP' });
        }

        // Paso 2: Insertar en la tabla usuarios
        const userId = await client.query(`
            INSERT INTO usuarios (nombre, apellidos, email, telefono, username, password_hash, rol)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
        `, [primerNombre, apellidos, email, telefono, username, passwordHash, 'PENDIENTE']);
        const usuarioId = userId.rows[0].id;

        // Paso 3: Insertar en la tabla alumnos (sin datos faltantes)
        const alumnoId = await client.query(`
            INSERT INTO alumnos (nombre, apellidos, email, telefono, documento_identificacion, num_documento_identificacion, estatus)
            VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id
        `, [primerNombre, apellidos, email, telefono, curp, curp, true]);
        const alumnoIdValue = alumnoId.rows[0].id;

        // Paso 4: Insertar en la tabla alumnos_cursos
        await client.query(`
            INSERT INTO alumnos_cursos (alumno_id, curso_id, plantel_id)
            VALUES ($1, $2, $3)
        `, [alumnoIdValue, curso, plantel]);

        // Commit de la transacción
        await client.query('COMMIT');

        // Enviar correo de validación
        const token = crypto.randomBytes(20).toString('hex');
        const validationLink = `https://icathi.vercel.app/public/validar-correo?token=${token}`;

        const mailOptions = {
            from: '"ICATHI" <icathi.edu@gmail.com>',
            to: email,
            subject: 'Confirmación de Registro',
            text: `Gracias por registrarte. Tu inscripción ha sido exitosa. Por favor, valida tu correo haciendo clic en el siguiente enlace: ${validationLink}`
        };

        await enviarCorreo(mailOptions);

        res.status(201).json({ message: 'Registro exitoso y correo enviado' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al registrar aspirante:', error);
        res.status(500).json({ error: 'Error al registrar aspirante' });
    } finally {
        client.release();
    }
};
exports.validarCorreo = async (req, res) => {
    const { token, email } = req.query;

    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT usuario_id FROM verificacion_correo WHERE token = $1
        `, [token]);

        if (result.rows.length === 0) {
            return res.status(400).json({ error: 'Token inválido o expirado' });
        }

        const usuarioId = result.rows[0].usuario_id;

        // Actualizar el estado del usuario a activo (o similar)
        await client.query(`
            UPDATE usuarios SET rol = 'ACTIVO' WHERE id = $1
        `, [usuarioId]);

        // Eliminar el token de verificación (opcional)
        await client.query(`
            DELETE FROM verificacion_correo WHERE token = $1
        `, [token]);

        res.status(200).json({ message: 'Correo verificado exitosamente. Ahora puedes completar tu registro.' });

    } catch (error) {
        console.error('Error al validar correo:', error);
        res.status(500).json({ error: 'Error al validar correo' });
    } finally {
        client.release();
    }
};
exports.completarDatosAlumno = async (req, res) => {
    const { usuarioId, fecha_nacimiento, genero, nivel_escolaridad, direccion } = req.body;

    // Validar que se hayan proporcionado todos los campos requeridos
    if (!usuarioId || !fecha_nacimiento || !genero || !nivel_escolaridad || !direccion) {
        return res.status(400).json({ error: 'Faltan datos requeridos para completar el registro' });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Actualizar la información del alumno
        await client.query(`
            UPDATE alumnos SET 
                fecha_nacimiento = $1, 
                genero = $2, 
                nivel_escolaridad = $3, 
                direccion = $4,
                updated_at = now()
            WHERE id = $5
        `, [fecha_nacimiento, genero, nivel_escolaridad, direccion, usuarioId]);

        // Commit de la transacción
        await client.query('COMMIT');

        res.status(200).json({ message: 'Datos del alumno actualizados exitosamente' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error al completar datos del alumno:', error);
        res.status(500).json({ error: 'Error al completar datos del alumno' });
    } finally {
        client.release();
    }
};

