require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../config/database'); // Tu configuración del pool de PostgreSQL
const { generateAuthToken } = require('../config/authUtils'); // Ajusta la ruta según tu estructura

// const MAX_LOGIN_ATTEMPTS = 5;

exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Buscar el usuario en la base de datos
    const query = `SELECT * FROM usuarios WHERE email = $1;`;
    const values = [email];
    const result = await pool.query(query, values);

    const user = result.rows[0];

    // Verificar si el usuario existe
    if (!user) {
      return res.status(404).json({ message: `El correo ${email} no está registrado` });
    }

    // Verificar si el usuario está activo
    if (!user.estatus) {
      return res.status(403).json({ message: 'La cuenta no está activa. Por favor, contacta al administrador.' });
    }

    // Comparar la contraseña
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (passwordMatch) {
      // Generar el token
      const token = generateAuthToken(user);

      // const token = generateAuthToken(user);
      return res.status(200).json({ 
        message: 'Inicio de sesión exitoso',
        token 
      });
    } else {
      // Aquí podrías implementar un sistema de intentos fallidos
      return res.status(401).json({ message: 'Credenciales inválidas. Inténtalo de nuevo.' });
    }
  } catch (error) {
    console.error('Error en la autenticación:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
