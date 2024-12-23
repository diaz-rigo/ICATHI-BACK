const pool = require("../config/database");

const AlumnosCursosPlantelModel = {
  // Obtener alumnos por plantel
  async obtenerAlumonosPorPlantel(plantelId) {
    try {
      const query = `
   SELECT  
    al.*,                 -- Todas las columnas de alumnos
    crs.nombre AS nombreCurso -- Nombre del curso
FROM 
    alumnos_cursos ac
INNER JOIN 
    alumnos al ON ac.alumno_id = al.id
INNER JOIN 
    cursos crs ON ac.curso_id = crs.id
LEFT JOIN 
    planteles_cursos plcrs ON plcrs.curso_id = crs.id 
        AND plcrs.plantel_id = $1  -- Condición para el plantel específico
WHERE 
    (plcrs.plantel_id = $1 OR plcrs.plantel_id IS NULL); -- Mostrar registros aunque no estén en planteles_cursos

      `;

      const values = [plantelId];
      const { rows } = await pool.query(query, values);

      return rows;
    } catch (error) {
      console.error("Error al obtener alumnos por plantel:", error);
      throw error;
    }
  },

  // Obtener información del curso por plantel
  async obtenerInformacionDelCursoPorPlantel(plantelId) {
    try {
      const query = `
      SELECT  
        al.*,   -- Selecciona todas las columnas de la tabla 'alumnos'
        crs.*,   -- Selecciona todas las columnas de la tabla 'cursos'
        al.nombre AS nombreAlumno,   -- Nombre del alumno
        crs.nombre AS nombreCurso,   -- Nombre del curso
        ars.nombre AS nombreArea,    -- Nombre del área
        esp.nombre AS nombreEspecialidad,  -- Nombre de la especialidad
        plcrs.fecha_inicio AS fecha_inicio,  -- Fecha de inicio
        plcrs.fecha_fin AS fecha_fin  -- Fecha de fin
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
      WHERE 
        plcrs.plantel_id = $1;
      `;

      const values = [plantelId];
      const { rows } = await pool.query(query, values);

      return rows;
    } catch (error) {
      console.error("Error al obtener información del curso por plantel:", error);
      throw error;
    }
  },

  // Actualizar calificación final de un alumno en un curso
  async actualizarCalificacionFinal(alumnoId, cursoId, nuevaCalificacion) {
    try {
      // Validar que la calificación esté en el rango permitido
      if (nuevaCalificacion < 0 || nuevaCalificacion > 10) {
        throw new Error("La calificación debe estar entre 0 y 10.");
      }

      const query = `
      UPDATE alumnos_cursos
      SET calificacion_final = $1, updated_at = NOW()
      WHERE alumno_id = $2 AND curso_id = $3;
      `;

      const values = [nuevaCalificacion, alumnoId, cursoId];
      const result = await pool.query(query, values);

      if (result.rowCount === 0) {
        throw new Error(`No se encontró el registro del alumno con ID ${alumnoId} en el curso con ID ${cursoId}.`);
      }

      return { success: true, message: "Calificación actualizada correctamente." };
    } catch (error) {
      console.error("Error al actualizar la calificación:", error);
      throw error;
    }
  },
};

module.exports = AlumnosCursosPlantelModel;
