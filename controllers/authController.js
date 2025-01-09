require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../config/database'); // Configuración del pool de PostgreSQL
const { generateAuthToken } = require('../config/authUtils'); // Ajusta la ruta según tu estructura

exports.signIn = async (req, res) => {
  const { email, password } = req.body;
  console.log("login",req.body)
  try {
    // Validar que la contraseña sea una cadena
    if (typeof password !== 'string') {
      return res.status(400).json({ message: 'La contraseña debe ser una cadena de texto' });
    }

    // Buscar en la tabla usuarios
    let query = `SELECT * FROM usuarios WHERE email = $1;`;
    let values = [email];
    let result = await pool.query(query, values);

    let user = result.rows[0];
    let userType = 'usuario';

    // Si no se encuentra en usuarios, buscar en planteles
    if (!user) {
      query = `SELECT * FROM planteles WHERE email = $1;`;
      result = await pool.query(query, values);
      user = result.rows[0];
      userType = 'PLANTEL';
    }

    // Si no se encuentra en planteles, buscar en docentes
    if (!user) {
      query = `SELECT * FROM docentes WHERE email = $1;`;
      result = await pool.query(query, values);
      user = result.rows[0];
      userType ='DOCENTE';
    }

    // Si no se encuentra en ninguna tabla
    if (!user) {
      return res.status(404).json({ message: `El correo ${email} no está registrado` });
    }

    // Verificar si el usuario está activo
    if (!user.estatus) {
      return res.status(403).json({ message: 'La cuenta no está activa. Por favor, contacta al administrador.' });
    }

    // Seleccionar el campo correcto de la base de datos
    const passwordHashField = userType === 'usuario' ? 'password_hash' : 'password';

    // Asegurar que la contraseña guardada en la base de datos sea una cadena
    const passwordHash = String(user[passwordHashField]);  // Convertir a cadena si es necesario

    // Comparar la contraseña
    const passwordMatch = await bcrypt.compare(password, passwordHash);

    if (passwordMatch) {
      // Generar el token
      const token = generateAuthToken({ ...user, userType });

      return res.status(200).json({ 
        message: 'Inicio de sesión exitoso',
        token 
      });
    } else {
      // Contraseña incorrecta
      return res.status(401).json({ message: 'Credenciales inválidas. Inténtalo de nuevo.' });
    }
  } catch (error) {
    console.error('Error en la autenticación:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
