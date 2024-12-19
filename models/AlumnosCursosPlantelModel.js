const pool = require("../config/database");

const AlumnosCursosPlantelModel = {
  async obtenerAlumonosPorPlantel(plantelId) {
    try {
      const query = `
      SELECT  
        al.*,  -- Nombre del alumno
        crs.nombre AS nombreCurso  -- Nombre del curso
      
      FROM 
        alumnos_cursos ac
      INNER JOIN 
        alumnos al ON ac.alumno_id = al.id
      INNER JOIN 
        cursos crs ON ac.curso_id = crs.id
      INNER JOIN 
        planteles_cursos plcrs ON plcrs.curso_id = crs.id
      WHERE 
        plcrs.plantel_id = $1;
    `;

      const values = [plantelId];
      const { rows } = await pool.query(query, values);

      return rows; // Retorna todos los cursos encontrados con la información del docente asignado
    } catch (error) {
      console.error("Error al alum:", error);
      throw error; // Lanza el error para manejarlo en el nivel superior
    }
  },
  async obtenerInformacionDelCursoPorPlantel(plantelId) {
    try {
      const query = `
      SELECT  
    al.*,   -- Selecciona todas las columnas de la tabla 'alumnos'
    crs.*,   -- Selecciona todas las columnas de la tabla 'cursos'
    al.nombre AS nombreAlumno,   -- Selecciona todas las columnas de la tabla 'alumnos'
    crs.nombre AS nombreCurso,   -- Selecciona todas las columnas de la tabla 'alumnos'
    ars.nombre AS nombreArea,   -- Selecciona todas las columnas de la tabla 'alumnos'
    esp.nombre AS nombreEspecialidad,   -- Selecciona todas las columnas de la tabla 'alumnos'
    plcrs.fecha_inicio AS fecha_inicio,  -- Selecciona todas las columnas de la tabla 'alumnos'
    plcrs.fecha_fin AS fecha_fin   -- Selecciona todas las columnas de la tabla 'alumnos'
FROM 
    alumnos_cursos ac
INNER JOIN 
    alumnos al ON ac.alumno_id = al.id
INNER JOIN 
    cursos crs ON ac.curso_id = crs.id
INNER JOIN 
    planteles_cursos plcrs ON plcrs.curso_id = crs.id
INNER JOIN 
    especialidades esp ON esp.id = crs.especialidad_id
INNER JOIN 
    areas ars ON ars.id = crs.area_id
         WHERE plcrs.plantel_id =$1;
    `;
      const values = [plantelId];
      const { rows } = await pool.query(query, values);

      return rows; // Retorna todos los cursos encontrados con la información del docente asignado
    } catch (error) {
      console.error("Error al alum:", error);
      throw error; // Lanza el error para manejarlo en el nivel superior
    }
  },
};
module.exports = AlumnosCursosPlantelModel;
