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
}