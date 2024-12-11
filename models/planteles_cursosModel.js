// Modelo para planteles_cursos con consultas directas a la base de datos
const pool = require('../config/database');

const PlantelesCursos = {
  async registrarSolicitud(data) {
    const {
      plantel_id,
      curso_id,
      horario,
      cupo_maximo,
      requisitos_extra,
      fecha_inicio,
      fecha_fin
    } = data;

    const query = `
      INSERT INTO planteles_cursos (plantel_id, curso_id, horario, cupo_maximo, requisitos_extra, fecha_inicio, fecha_fin)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const values = [plantel_id, curso_id, horario, cupo_maximo, requisitos_extra, fecha_inicio, fecha_fin];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async obtenerSolicitudes() {
    const query = 'SELECT * FROM planteles_cursos;';
    const { rows } = await pool.query(query);
    return rows;
  },

  async actualizarEstatus(id, estatus, observacion = null) {
    const query = `
      UPDATE planteles_cursos
      SET estatus = $1, requisitos_extra = COALESCE($2, requisitos_extra), updated_at = now()
      WHERE id = $3
      RETURNING *;
    `;

    const values = [estatus, observacion, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  }
};

module.exports = PlantelesCursos;