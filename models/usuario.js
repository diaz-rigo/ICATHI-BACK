const pool = require('../config/database'); // Importa la configuración del pool de conexiones
const bcrypt = require('bcrypt');

const { generateAuthToken } = require('../config/authUtils'); // Importa la función para generar el token

const Usuario = {
  async actualizarEstatusYRol(id, estatus, rol) {
    const query = `
      UPDATE usuarios
      SET estatus = $1,
          rol = $2,
          updated_at = now()
      WHERE id = $3;
    `;
    const result = await pool.query(query, [estatus, rol, id]);
    return result.rowCount > 0; // Retorna `true` si se actualizó alguna fila, `false` en caso contrario
  },
  async insertarUsuario(nombre, apellidos, email, telefono, rol, estatus,username,passwordHash) {

    const query = `
    INSERT INTO usuarios (nombre, apellidos, email, telefono, rol, estatus,username,password_hash)
    VALUES ($1, $2, $3, $4, $5, $6,$7,$8)
    RETURNING id;
  `;
    const { rows } = await pool.query(query, [nombre, apellidos, email, telefono, rol, estatus, username,passwordHash]);
    return rows[0].id;
  },
  async insertarTokenValidacion(id, token) {
    const query = `
    INSERT INTO validaciones_email (usuario_id, token)
    VALUES ($1, $2);
  `;
    await pool.query(query, [id, token]);

  },
  async generarToken(id, nuevoRol) {
    // Consulta para obtener los datos del usuario
    const query = `SELECT id, email, nombre, apellidos FROM usuarios WHERE id = $1`;
    const { rows } = await pool.query(query, [id]);

    const usuario = rows[0];

    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    // Agregar el nuevo rol al usuario
    usuario.rol = nuevoRol;

    // Generar el token con la función importada
    const token = generateAuthToken(usuario);

    return token; // Devolver el token generado
  },


  async cambiarRol(id, nuevoRol) {
    console.log('ID para actualizar:', id);
    console.log('Nuevo rol:', nuevoRol);

    const query = `
      UPDATE usuarios
      SET rol = $1, updated_at = now()
      WHERE id = $2
      RETURNING *;
    `;
    const values = [nuevoRol, id];

    try {
      const result = await pool.query(query, values);
      if (result.rowCount === 0) {
        throw new Error(`No se encontró un usuario con el id ${id}`);
      }
      return result.rows[0]; // Retorna el usuario con el rol actualizado
    } catch (error) {
      console.error('Error al cambiar rol:', error.message);
      throw error;
    }
  }

  ,
  async crearUsuario(data) {
    const { nombre, apellidos, email, username, password, rol } = data;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const query = `
      INSERT INTO usuarios (nombre, apellidos, email, username, password_hash, rol, estatus)
      VALUES ($1, $2, $3, $4, $5, $6, false)
      RETURNING *;
    `;

    const values = [nombre, apellidos, email, username, hashedPassword, rol];

    try {
        const result = await pool.query(query, values);
        return result.rows[0]; 
    } catch (error) {
        console.error('Error al crear usuario:', error.message);

        if (error.code === '23505') {
            // Verificamos si la restricción violada es por el email o el username
            if (error.constraint === 'usuarios_email_key') {
                throw new Error("El correo electrónico ya está registrado.");
            } else if (error.constraint === 'usuarios_username_key') {
                throw new Error("El nombre de usuario ya está en uso.");
            }
        } else if (error.code === '23502') {
            throw new Error("Todos los campos son obligatorios.");
        } else if (error.code === '08003') {
            throw new Error("Error de conexión con la base de datos. Intenta más tarde.");
        } else {
            throw new Error("Ocurrió un error inesperado. Intenta más tarde.");
        }
    }
}

  
,
  // Listar todos los usuarios
  async listarUsuarios() {
    const query = `
    SELECT * FROM usuarios;
  `;

    try {
      const result = await pool.query(query);
      return result.rows; // Retorna la lista de usuarios
    } catch (error) {
      console.error('Error al listar usuarios:', error.message);
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
  async  eliminarUsuario(id) {
    const verificarRelaciones = `
      SELECT
        CASE
          WHEN EXISTS (SELECT 1 FROM docentes WHERE id_usuario = $1) THEN 'DOCENTE'
          WHEN EXISTS (SELECT 1 FROM alumnos WHERE id_user = $1) THEN 'ALUMNO'
          ELSE 'NO_RELACIONADO'
        END AS tipo_usuario
    `;
    const eliminarRelacionesDocente = `DELETE FROM docentes WHERE id_usuario = $1;`;
    const eliminarRelacionesAlumno = `DELETE FROM alumnos WHERE id_user = $1;`;
    const eliminarUsuarioQuery = `
      DELETE FROM usuarios
      WHERE id = $1
      RETURNING *;
    `;
  
    try {
      // Verifica si el usuario está relacionado con otras tablas
      const result = await pool.query(verificarRelaciones, [id]);
      const tipoUsuario = result.rows[0]?.tipo_usuario;
  
      if (!tipoUsuario) {
        throw new Error('El usuario no existe.');
      }
  
      // Si es un docente, elimina los registros relacionados en la tabla "docentes"
      if (tipoUsuario === 'DOCENTE') {
        await pool.query(eliminarRelacionesDocente, [id]);
      }
  
      // Si es un alumno, elimina los registros relacionados en la tabla "alumnos"
      if (tipoUsuario === 'ALUMNO') {
        await pool.query(eliminarRelacionesAlumno, [id]);
      }
  
      // Finalmente, elimina al usuario
      const usuarioEliminado = await pool.query(eliminarUsuarioQuery, [id]);
  
      console.log(`Usuario de tipo ${tipoUsuario} eliminado correctamente.`);
      return usuarioEliminado.rows[0];
    } catch (error) {
      console.error('Error al eliminar usuario:', error.message);
      throw error;
    }
  }
,  
};

module.exports = Usuario;
