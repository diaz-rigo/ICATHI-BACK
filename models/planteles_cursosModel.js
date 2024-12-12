const pool = require('../config/database');

const PlantelesCursos = {
  async registrarSolicitud(data) {
    const {
      plantel_id,
      curso_id,
      horario = '',
      cupo_maximo,
      requisitos_extra = '',
      fecha_inicio = null,
      fecha_fin = null
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
  },

  async obtenerCursosPorPlantel(plantelId) {
    try {
        const query = `
            SELECT c.*, 
                   (SELECT COUNT(*) 
                    FROM cursos_docentes cd 
                    WHERE cd.curso_id = c.id) AS docente_asignado
            FROM cursos c
            INNER JOIN planteles_cursos pc ON c.id = pc.curso_id
            INNER JOIN planteles p ON pc.plantel_id = p.id
            WHERE p.id = $1;
        `;

        const values = [plantelId];
        const { rows } = await pool.query(query, values);
        
        return rows; // Retorna todos los cursos encontrados con la información del docente asignado
    } catch (error) {
        console.error('Error al obtener cursos por plantel:', error);
        throw error; // Lanza el error para manejarlo en el nivel superior
    }
}

};

module.exports = PlantelesCursos;
