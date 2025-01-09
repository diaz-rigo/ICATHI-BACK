const pool = require('../config/database');

const EspecialidadesModel = {
  async getAll() {
    const query = 'SELECT id, nombre, area_id FROM especialidades';
    const { rows } = await pool.query(query);
    return rows;
  },
  async getSearchDocente(idPlantel, cursoId, especialidadId, docenteId) {
    try {
      const query = `
        SELECT 
          d.id AS docente_id,
          d.nombre AS nombre_docente, 
          d.apellidos AS apellidos_docente,
          d.email AS email_docente,
          d.telefono AS telefono_docente,
          d.especialidad AS especialidad_docente,
          d.estatus_id AS estatus_docente
        FROM docentes d
        JOIN docentes_especialidades de ON d.id = de.docente_id
        JOIN cursos c ON de.especialidad_id = c.especialidad_id
        WHERE d.estatus_id = 6 -- Docentes activos
          AND (c.id = $1 OR de.especialidad_id = $2)
          AND d.id = $3
      `;

      const result = await pool.query(query, [cursoId, especialidadId, docenteId]);
      return result.rows;
    } catch (error) {
      throw new Error('Error al obtener los docentes: ' + error.message);
    }
  },


  async getEspecialidadesByAreaId(areaId) {
    const query = `
      SELECT id, nombre, descripcion
      FROM especialidades
      WHERE area_id = $1
    `;

    try {
      const { rows } = await pool.query(query, [areaId]);
      return rows;
    } catch (error) {
      console.error('Error al obtener las especialidades:', error);
      throw error;
    }
  },
  async  obtenerEspecialidadesPorPlantel(plantelId) {
    const query = `
      SELECT DISTINCT e.id AS especialidad_id, 
                      e.nombre AS especialidad_nombre, 
                      e.descripcion AS especialidad_descripcion
      FROM especialidades e
      INNER JOIN cursos c ON e.id = c.especialidad_id
      INNER JOIN planteles_cursos pc ON c.id = pc.curso_id
      WHERE pc.plantel_id = ${plantelId};
    `;
  
    try {
      const { rows } = await pool.query(query);
      return rows;
    } catch (error) {
      console.error('Error obteniendo especialidades por plantel:', error);
      throw error;
    }
  }
  

};

module.exports = EspecialidadesModel;