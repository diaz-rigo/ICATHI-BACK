// Controlador para manejar las solicitudes
const AlumnosCursosPlantelModel = require("../models/AlumnosCursosPlantelModel");

module.exports = {
  async getByIdPlantel(req, res) {
    try {
      const { idPlantel } = req.params;

      // Realiza el INNER JOIN para obtener los cursos del plantel
      const cursos = await AlumnosCursosPlantelModel.obtenerAlumonosPorPlantel(
        idPlantel
      );

      if (!cursos.length) {
        return res
          .status(404)
          .json({ error: "No se encontraron cursos para este plantel" });
      }

      res.status(200).json(cursos);
    } catch (error) {
      console.error("Error al obtener los alumnos:", error);
      res.status(500).json({ error: "Error al obtener los cursos" });
    }
  },
  async getInfoByIdPlantel(req, res) {
    try {
      const { idPlantel } = req.params;

      // Realiza el INNER JOIN para obtener los cursos del plantel
      const cursos = await AlumnosCursosPlantelModel.obtenerInformacionDelCursoPorPlantel(
        idPlantel
      );

      if (!cursos.length) {
        return res
          .status(404)
          .json({ error: "No se encontraron cursos para este plantel" });
      }

      res.status(200).json(cursos);
    } catch (error) {
      console.error("Error al obtener los alumnos:", error);
      res.status(500).json({ error: "Error al obtener los cursos" });
    }
  },
  async actualizarCalificacionFinal(req, res) {
    try {
      const { alumnoId, cursoId } = req.params;
      const { nuevaCalificacion } = req.body;

      // Validar que la calificación está en el rango permitido
      if (nuevaCalificacion < 0 || nuevaCalificacion > 10) {
        return res.status(400).json({
          error: "La calificación debe estar entre 0 y 10."
        });
      }

      // Llama al modelo para actualizar la calificación
      const resultado = await AlumnosCursosPlantelModel.actualizarCalificacionFinal(
        alumnoId,
        cursoId,
        nuevaCalificacion
      );

      if (resultado.rowCount === 0) {
        return res.status(404).json({
          error: "No se encontró el registro del alumno o curso especificado."
        });
      }

      res.status(200).json({
        mensaje: "Calificación actualizada correctamente."
      });
    } catch (error) {
      console.error("Error al actualizar la calificación:", error);
      res.status(500).json({
        error: "Error interno del servidor al actualizar la calificación."
      });
    }
  }

,
async getCursosDePlantelPorIdAlumno(req, res) {
  try {
    const { alumnoId } = req.params;
    // Llama al método correcto del modelo
    const data = await AlumnosCursosPlantelModel.getCursosDePlantelPorIdAlumno(alumnoId);
    res.status(200).json(data);
  } catch (error) {
    console.error("Error en getCursosDePlantelPorIdAlumno:", error);
    res.status(500).json({ error: "Error al obtener la información detallada del alumno y sus cursos" });
  }
},
async obtenerAlumnos(req, res) {

// async obtenerAlumnos(req, res) {
  const { plantelId, cursoId } = req.params;

  try {
    if (!plantelId || !cursoId) {
      return res.status(400).json({ message: "Plantel ID y Curso ID son requeridos." });
    }

    const alumnos = await AlumnosCursosPlantelModel.obtenerAlumnosPorPlantelYCurso(plantelId, cursoId);
    return res.status(200).json(alumnos);
  } catch (error) {
    console.error("Error en obtenerAlumnos:", error);
    return res.status(500).json({ message: "Error al obtener los alumnos." });
  }
},
}