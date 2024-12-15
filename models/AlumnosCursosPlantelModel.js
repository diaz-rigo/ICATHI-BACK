const pool = require("../config/database");

const AlumnosCursosPlantelModel = {
  async obtenerAlumonosPorPlantel(plantelId) {
    try {
      const query = `
      SELECT  
      al.*
        FROM alumnos_cursos ac
        INNER JOIN alumnos al ON ac.alumno_id = al.id
         WHERE plantel_id =$1;
    `;
      const values = [plantelId];
      const { rows } = await pool.query(query, values);

      return rows; // Retorna todos los cursos encontrados con la información del docente asignado
    } catch (error) {
      console.error("Error al alumos de ese plantel:", error);
      throw error; // Lanza el error para manejarlo en el nivel superior
    }
  },
};
module.exports=AlumnosCursosPlantelModel;