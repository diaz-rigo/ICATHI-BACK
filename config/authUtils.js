// authUtils.js (archivo donde está definida)
const jwt = require('jsonwebtoken');

// Función para generar el token de autenticación
function generateAuthToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    nombre: user.nombre,
    apellidos: user.apellidos,
    rol: user.rol, // Rol del usuario incluido en el token
  };

  const secretKey = process.env.JWT_KEY || 'clave_secreta'; // Define tu clave secreta en el .env
  const expiresIn = '5h'; // El tiempo de expiración del token

  return jwt.sign(payload, secretKey, { expiresIn });
}

module.exports = { generateAuthToken };
