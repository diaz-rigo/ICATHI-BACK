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
};

module.exports = AlumnoModel;
