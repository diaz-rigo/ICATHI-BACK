const { enviarCorreo } = require('../config/nodemailer'); // Importa la función para enviar correos
const crypto = require('crypto'); // Para generar un token aleatorio de validación
const pool = require('../config/database'); // Importa la configuración del pool de conexiones
const bcrypt = require('bcrypt');
const Usuario = require('../models/usuario'); // Importa el modelo Usuario
const AlumnoModel = require('../models/AlumnoModel'); // Importa el modelo Alumno
exports.obtenerCurpPorEmail = async (req, res) => {
    const { email } = req.params; // Obtiene el email desde los parámetros de la ruta
    console.log(req.params)
    try {
      // Llama al modelo para obtener la CURP
      const curp = await AlumnoModel.getCurpByEmail(email);
  
      // Responde con la CURP obtenida
      res.status(200).json({
        success: true,
        message: `CURP encontrado para el email ${email}`,
        data: { curp }
      });
    } catch (error) {
      // Manejo de errores
      console.error('Error al obtener CURP por email:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Error al obtener CURP'
      });
    }
  };
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

      // Paso 3: Insertar en la tabla alumnos (ahora con el id_user)
      const alumnoId = await client.query(`
          INSERT INTO alumnos (nombre, apellidos, email, telefono, documento_identificacion, num_documento_identificacion, estatus, id_user)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id
      `, [primerNombre, apellidos, email, telefono, curp, curp, true, usuarioId]);
      const alumnoIdValue = alumnoId.rows[0].id;

        // Paso 4: Insertar en la tabla alumnos_cursos
        await client.query(`
            INSERT INTO alumnos_cursos (alumno_id, curso_id, plantel_id)
            VALUES ($1, $2, $3)
        `, [alumnoIdValue, curso, plantel]);

        // Commit de la transacción
        await client.query('COMMIT');

        // Enviar correo de validación
        // const token = crypto.randomBytes(20).toString('hex');
        const token = crypto.randomBytes(32).toString('hex');

        // Insertar el token en la base de datos
        await Usuario.insertarTokenValidacion(usuarioId, token);
    
        
        // const validationLink = `https://icathi.vercel.app/public/validar-cor<reo?token=${token}`;
        // const validationLink = `http://localhost:4200/public/validar-correo?token=${token}`;
        const validationLink = `https://icathi.vercel.app/public/validar-correo?token=${token}`;
        // const mailOptions = {
        //     from: '"ICATHI" <icathi.edu@gmail.com>',
        //     to: email,
        //     subject: 'Confirmación de Registro',
        //     text: `Gracias por registrarte. Tu inscripción ha sido exitosa. Por favor, valida tu correo haciendo clic en el siguiente enlace: ${validationLink}`
        // };
        const mailOptions = {
            from: '"ICATHI" <icathi.edu@gmail.com>',
            to: email,
            subject: 'Accede a tu cuenta en ICATHI',
            html: `
              <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; border-radius: 10px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
                <!-- Header -->
                <div style="background-color: #44509D; padding: 15px 20px; border-radius: 10px 10px 0 0; color: white; text-align: center; border-bottom: 2px solid #f08762;">
                  <h1 style="margin: 0; font-size: 24px;">ICATHI</h1>
                </div>
          
                <!-- Logo -->
                <div style="text-align: center; margin: 20px 0;">
                  <img src="https://res.cloudinary.com/dgoi24lma/image/upload/v1733759497/ut4pyd5fi9pbsdmhj6n6.png" alt="Logo ICATHI" style="max-width: 150px; height: auto; border-radius: 10px; border: 1px solid #ddd;" />
                </div>
          
                <!-- Body -->
                <div style="padding: 20px; background-color: #ffffff; border-radius: 0 0 10px 10px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
                  <p style="font-size: 16px; color: #333; margin: 0;">Hola <strong>${primerNombre}</strong>,</p>
                  <p style="font-size: 16px; color: #333; line-height: 1.5;">Tu registro en ICATHI ha sido exitoso. Ahora puedes acceder a tu cuenta y perfil utilizando las siguientes credenciales:</p>
                  
                  <ul style="font-size: 16px; color: #333; line-height: 1.5; padding-left: 20px; margin: 20px 0;">
                    <li><strong>Correo:</strong> ${email}</li>
                    <li><strong>Contraseña:</strong> la que elegiste al registrarte</li>
                    <li><strong>CURP:</strong> tu CURP registrada</li>
                  </ul>
          
                  <p style="font-size: 16px; color: #333; line-height: 1.5;">Para iniciar sesión, haz clic en el siguiente botón:</p>
          
                  <!-- Button -->
                  <div style="text-align: center; margin: 20px 0;">
                    <a href="${validationLink}" style="background-color: #f08762; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; border: 2px solid #d97554;">Acceder a mi cuenta</a>
                  </div>
          
                  <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
          
                  <p style="font-size: 14px; color: #777; text-align: center; margin: 0;">Si tienes algún problema para acceder a tu cuenta, por favor contáctanos.</p>
                  <p style="font-size: 14px; color: #777; text-align: center; margin: 5px 0;">Gracias por confiar en nosotros,</p>
                  <p style="font-size: 14px; color: #777; text-align: center; font-weight: bold;">Equipo ICATHI</p>
                </div>
          
                <!-- Footer -->
                <div style="padding: 15px; background-color: #f9f9f9; border-top: 1px solid #ddd; text-align: center; border-radius: 0 0 10px 10px;">
                  <p style="font-size: 12px; color: #666; margin: 0;">© 2024 ICATHI. Todos los derechos reservados.</p>
                  <p style="font-size: 12px; color: #666; margin: 0;">Este es un mensaje automático. Por favor, no respondas a este correo.</p>
                </div>
              </div>
            `,
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
