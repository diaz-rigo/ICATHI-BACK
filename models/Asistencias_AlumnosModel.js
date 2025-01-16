const pool = require('../config/database');

const AsistenciasModel = {
  // Obtener todas las asistencias
  async getAll() {
    const query = 'SELECT * FROM asistencias';
    const { rows } = await pool.query(query);
    return rows;
  },

  // Obtener una asistencia por ID
  async getById(id) {
    const query = 'SELECT * FROM asistencias WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

  // Crear una nueva asistencia
  async create(asistencia) {
    const query = `
      INSERT INTO asistencias (alumno_id, curso_id, plantel_id, fecha, observaciones, total_asistencias)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const values = [
      asistencia.alumno_id,
      asistencia.curso_id,
      asistencia.plantel_id,
      asistencia.fecha,
      asistencia.observaciones,
      asistencia.total_asistencias || 0,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  // Actualizar una asistencia por ID
  async update(id, asistencia) {
    const query = `
      UPDATE asistencias
      SET alumno_id = $1,
          curso_id = $2,
          plantel_id = $3,
          fecha = $4,
          observaciones = $5,
          total_asistencias = $6,
          updated_at = now()
      WHERE id = $7
      RETURNING *;
    `;
    const values = [
      asistencia.alumno_id,
      asistencia.curso_id,
      asistencia.plantel_id,
      asistencia.fecha,
      asistencia.observaciones,
      asistencia.total_asistencias || 0,
      id,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  // Eliminar una asistencia por ID
  async delete(id) {
    const query = 'DELETE FROM asistencias WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },
};

module.exports = AsistenciasModel;
