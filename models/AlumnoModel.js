const pool = require('../config/database');

const AlumnoModel = {

  async getAll() {
    try {
      const query = 'SELECT * FROM alumnos';
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error('Error al obtener alumnos:', error);
      throw error;
    }
  },
  async getCurpByEmail(email) {
    console.log("Recibido en el modelo:", email);
    try {
      if (!email) {
        throw new Error('El email proporcionado es inválido.');
      }
  
      const querySelect = 'SELECT num_documento_identificacion FROM alumnos WHERE email = $1';
      const valuesSelect = [email];
      const { rows } = await pool.query(querySelect, valuesSelect);
  
      if (rows.length === 0) {
        throw new Error(`No se encontró un alumno con el email: ${email}`);
      }
  
      const curp = rows[0].num_documento_identificacion;
  
      // Actualizar el rol y el estado
      const queryUpdate = `
        UPDATE usuarios
        SET rol = $1, estatus = $2
        WHERE email = $3
      `;
      const valuesUpdate = ['ALUMNO', true, email];
  
      await pool.query(queryUpdate, valuesUpdate);
      console.log(`Rol y estado actualizados correctamente para el email: ${email}`);
  
      return curp; // Devuelve el CURP después de la actualización
    } catch (error) {
      console.error('Error al obtener y actualizar CURP por email:', error);
      throw error;
    }
  }
  
,  
  async getById(id) {
    try {
      const query = 'SELECT * FROM alumnos WHERE id = $1';
      const { rows } = await pool.query(query, [id]);
      return rows[0] || null; // Devuelve null si no se encuentra el alumno
    } catch (error) {
      console.error('Error al obtener alumno:', error);
      throw error;
    }
  },

  async create(alumnoData) {
    try {
      const { nombre, apellidos, ...rest } = alumnoData;
      const keys = Object.keys(rest);
      const values = Object.values(rest);

      const query = `
        INSERT INTO alumnos (nombre, apellidos, ${keys.join(', ')}) 
        VALUES ($1, $2, ${values.map((_, index) => `$${index + 3}`).join(', ')}) 
        RETURNING *;
      `;

      const { rows } = await pool.query(query, [nombre, apellidos, ...values]);
      return rows[0];
    } catch (error) {
      console.error('Error al crear alumno:', error);
      throw error;
    }
  },

  async update(id, alumnoData) {
    try {
      const keys = Object.keys(alumnoData);
      const values = Object.values(alumnoData);

      const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');

      const query = `
        UPDATE alumnos 
        SET ${setClause} 
        WHERE id = $1 
        RETURNING *;
      `;

      const { rows } = await pool.query(query, [id, ...values]);
      return rows[0] || null; // Devuelve null si no se encuentra el alumno
    } catch (error) {
      console.error('Error al actualizar alumno:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const query = 'DELETE FROM alumnos WHERE id = $1 RETURNING *;';
      const { rows } = await pool.query(query, [id]);
      return rows[0] || null; // Devuelve null si no se encuentra el alumno
    } catch (error) {
      console.error('Error al eliminar alumno:', error);
      throw error;
    }
  },
  async getByUserId(userId) {
    try {
      // Consulta SQL para obtener los registros de alumnos asociados al ID del usuario
      const query = `
        SELECT 
          id, nombre, apellidos, email, telefono, documento_identificacion, 
          num_documento_identificacion, nivel_escolaridad, discapacidad, 
          direccion, estatus, created_at, updated_at, foto_url, tutor_nombre, 
          tutor_telefono, genero_id, id_user 
        FROM alumnos 
        WHERE id_user = $1 AND estatus = true;
      `;
  
      // Ejecutar la consulta con el userId proporcionado
      const result = await pool.query(query, [userId]);
  
      // Retorna todos los registros asociados al userId con estatus activo (estatus = true)
      return result.rows;
    } catch (error) {
      console.error('Error al obtener el alumno por ID del usuario:', error); 
      throw error; // Lanza el error para que pueda ser manejado por el llamador
    }
  }
  
};

module.exports = AlumnoModel;
