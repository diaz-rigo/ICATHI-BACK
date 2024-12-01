const pool = require('../config/database'); // Importa la configuración del pool de conexiones
const bcrypt = require('bcrypt');

const Usuario = {
  // Crear un nuevo usuario
  async crearUsuario(data) {
    const { nombre, apellidos, email, username, password, rol } = data;

    // Cifrar la contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO usuarios (nombre, apellidos, email, username, password_hash, rol, estatus)
      VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING *;
    `;
    const values = [nombre, apellidos, email, username, passwordHash, rol];

    try {
      const result = await pool.query(query, values);
      return result.rows[0]; // Retorna el usuario creado
    } catch (error) {
      console.error('Error al crear usuario:', error.message);
      throw error;
    }
  },

  // Obtener un usuario por email o username
  async obtenerUsuarioPorEmailOUsername(email, username) {
    const query = `
      SELECT * FROM usuarios
      WHERE email = $1 OR username = $2;
    `;
    const values = [email, username];

    try {
      const result = await pool.query(query, values);
      return result.rows[0]; // Retorna el usuario encontrado
    } catch (error) {
      console.error('Error al obtener usuario:', error.message);
      throw error;
    }
  },

  // Actualizar usuario
  async actualizarUsuario(id, data) {
    const { nombre, apellidos, email, username, rol, estatus } = data;

    const query = `
      UPDATE usuarios
      SET nombre = $1, apellidos = $2, email = $3, username = $4, rol = $5, estatus = $6
      WHERE id = $7
      RETURNING *;
    `;
    const values = [nombre, apellidos, email, username, rol, estatus, id];

    try {
      const result = await pool.query(query, values);
      return result.rows[0]; // Retorna el usuario actualizado
    } catch (error) {
      console.error('Error al actualizar usuario:', error.message);
      throw error;
    }
  },

  // Eliminar usuario
  async eliminarUsuario(id) {
    const query = `
      DELETE FROM usuarios
      WHERE id = $1
      RETURNING *;
    `;
    const values = [id];

    try {
      const result = await pool.query(query, values);
      return result.rows[0]; // Retorna el usuario eliminado
    } catch (error) {
      console.error('Error al eliminar usuario:', error.message);
      throw error;
    }
  },
};

module.exports = Usuario;
