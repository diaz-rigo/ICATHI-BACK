const Usuario = require('../models/usuario'); // Importa el modelo Usuario
const { enviarCorreo } = require('../config/nodemailer'); // Importa la función para enviar correos
const crypto = require('crypto'); // Para generar un token aleatorio de validación
const pool = require('../config/database'); // Importa la configuración del pool de conexiones
const bcrypt = require('bcrypt');

exports.registrarUsuarioInicial = async (req, res) => {
  const { firstName, lastName1, lastName2, email, phone } = req.body;

  // Generar automáticamente un username basado en el nombre y apellido
  const username = `${firstName.toLowerCase()}_${lastName1.toLowerCase()}`.substring(0, 15);

  // Generar hash de la contraseña
  const saltRounds = 10;
  const passwordHash = await bcrypt.hash('defaultPassword', saltRounds);


  const client = await pool.connect(); // Usa el pool que importaste

  try {
    await client.query('BEGIN');
    // Verificar si el correo ya existe
    const emailCheckQuery = 'SELECT COUNT(*) FROM usuarios WHERE email = $1';
    const emailCheckResult = await client.query(emailCheckQuery, [email]);
    if (parseInt(emailCheckResult.rows[0].count, 10) > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'El correo electrónico ya está registrado.' });
    }

    // Insertar usuario en la base de datos
    const userId = await Usuario.insertarUsuario(
      `${firstName}`,
      `${lastName1} ${lastName2}`,
      email,
      phone,
      'PENDIENTE', // Rol temporal hasta completar la validación
      false, // Usuario inactivo hasta validar el correo
      username, // Usar el username generado automáticamente
      passwordHash // Password hash

    );
    // Insertar en la tabla 'docentes' usando el id_usuario recién creado
    const queryInsertDocente = `
INSERT INTO docentes (nombre, apellidos, email, telefono, id_usuario)
VALUES ($1, $2, $3, $4, $5) RETURNING id;
`;
    const valuesDocente = [
      firstName,
      `${lastName1} ${lastName2}`,
      email,
      phone,
      userId, // El id del usuario recién insertado
    ];
    const resultDocente = await client.query(queryInsertDocente, valuesDocente);
    const docenteId = resultDocente.rows[0].id;
    // Generar token de validación para el correo electrónico
    const token = crypto.randomBytes(32).toString('hex');

    // Insertar el token en la base de datos
    await Usuario.insertarTokenValidacion(userId, token);

    // Crear el enlace de validación con el token
    const validationLink = `https://icathi.vercel.app/public/validar-correo?token=${token}`;
    // const validationLink = `http://localhost:4200/public/validar-correo?token=${token}`;

    const mailOptions = {
      from: '"ICATHI" <icathi.edu@gmail.com>',
      to: email,
      subject: 'Confirma tu correo electrónico',
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
            <p style="font-size: 16px; color: #333; margin: 0;">Hola <strong>${firstName}</strong>,</p>
            <p style="font-size: 16px; color: #333; line-height: 1.5;">¡Bienvenido a ICATHI! Estamos encantados de que te unas a nuestra comunidad. Para completar tu registro, por favor confirma tu correo electrónico haciendo clic en el siguiente botón:</p>
            
            <!-- Button -->
            <div style="text-align: center; margin: 20px 0;">
              <a href="${validationLink}" style="background-color: #f08762; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; border: 2px solid #d97554;">Confirmar correo</a>
            </div>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
    
            <p style="font-size: 14px; color: #777; text-align: center; margin: 0;">Si no solicitaste esta verificación, puedes ignorar este mensaje.</p>
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

    // Enviar el correo de validación
    await enviarCorreo(mailOptions);

    await client.query('COMMIT');
    res.status(201).json({ message: 'Usuario registrado exitosamente. Verifica tu correo electrónico.' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ message: 'Error al registrar el usuario.' });
  } finally {
    client.release();
  }
};


exports.validarCorreo = async (req, res) => {
  const { token } = req.query;

  // Validar que el token esté presente
  if (!token) {
    return res.status(400).json({ message: 'Token no proporcionado.' });
  }

  const client = await pool.connect();
  try {
    // Verificar si el token existe en la base de datos
    const queryToken = `
      SELECT usuario_id FROM validaciones_email WHERE token = $1;
    `;
    const { rows } = await client.query(queryToken, [token]);
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Token inválido o expirado.' });
    }

    const userId = rows[0].usuario_id;

    // Obtener el correo del usuario para incluirlo en la respuesta
    const queryUsuario = `
      SELECT email, correo_validado FROM usuarios WHERE id = $1;
    `;
    const { rows: usuarioRows } = await client.query(queryUsuario, [userId]);

    if (usuarioRows.length === 0) {
      return res.status(400).json({ message: 'Usuario no encontrado.' });
    }

    const userEmail = usuarioRows[0].email;
    const correoValidado = usuarioRows[0].correo_validado;

    // Verificar si el correo ya ha sido validado
    if (correoValidado) {
      return res.status(400).json({ message: 'El correo ya ha sido validado.' });
    }

    // Activar usuario
    const queryActivarUsuario = `
      UPDATE usuarios SET estatus = false, correo_validado = true WHERE id = $1;
    `;
    await client.query(queryActivarUsuario, [userId]);

    // Eliminar token de la base de datos
    const queryEliminarToken = `
      DELETE FROM validaciones_email WHERE token = $1;
    `;
    await client.query(queryEliminarToken, [token]);

    // Responder con el mensaje, id del usuario y correo
    res.status(200).json({
      message: 'Correo validado exitosamente.',
      userId: userId,
      userEmail: userEmail,
    });
  } catch (error) {
    console.error('Error al intentar validar el correo:', error.message);
    console.error('Pila de error:', error.stack);
    res.status(500).json({ message: 'Error al validar el correo.' });
  } finally {
    client.release();
  }
};

exports.crearPassword = async (req, res) => {
  const { email, nuevaContraseña } = req.body;
  console.log(req.body);

  const client = await pool.connect();
  try {
    // Verificar si el usuario existe
    const queryUsuario = `
      SELECT id, correo_validado FROM usuarios WHERE email = $1;
    `;
    const { rows } = await client.query(queryUsuario, [email]);

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
    }

    const usuario = rows[0];

    // Verificar si el correo ha sido validado
    if (!usuario.correo_validado) {
      return res.status(400).json({ mensaje: 'Correo no validado.' });
    }

    console.log(nuevaContraseña); // Verifica que la nueva contraseña esté llegando correctamente
    const hashedPassword = await bcrypt.hash(nuevaContraseña, 10);

    // Actualizar la contraseña en la base de datos
    const queryActualizarContraseña = `
      UPDATE usuarios SET password_hash = $1 WHERE email = $2;
    `;
    await client.query(queryActualizarContraseña, [hashedPassword, email]);

    // Verificar si el correo existe en la tabla docentes
    const queryDocente = `
      SELECT id FROM docentes WHERE email = $1;
    `;
    const docenteResult = await client.query(queryDocente, [email]);

    if (docenteResult.rows.length > 0) {
      // Actualizar el rol del usuario a DOCENTE
      const queryActualizarRol = `
        UPDATE usuarios SET estatus = true,   rol = 'DOCENTE' WHERE email = $1;
      `;
      await client.query(queryActualizarRol, [email]);
    }
    // Activar usuario
    // const queryActivarUsuario = `
    //   UPDATE usuarios SET estatus = false, correo_validado = true WHERE id = $1;
    // `;
    // await client.query(queryActivarUsuario, [userId]);

    res.json({ mensaje: 'Contraseña creada correctamente y rol actualizado ...' });
  } catch (error) {
    console.error('Error al intentar crear la contraseña:', error.message);
    console.error('Pila de error:', error.stack); // Esto te mostrará la ubicación exacta del error.
    res.status(500).json({ mensaje: 'Error al crear la contraseña.' });
  } finally {
    client.release();
  }
};
