// Controlador para manejar las solicitudes
const PlantelesCursosModel = require("../models/planteles_cursosModel");

module.exports = {
  async getByIdPlantel(req, res) {
    try {
      const { idPlantel } = req.params;

      // Realiza el INNER JOIN para obtener los cursos del plantel
      const cursos = await PlantelesCursosModel.obtenerCursosPorPlantel(
        idPlantel
      );

      if (!cursos.length) {
        return res
          .status(404)
          .json({ error: "No se encontraron cursos para este plantel" });
      }

      res.status(200).json(cursos);
    } catch (error) {
      console.error("Error al obtener los cursos:", error);
      res.status(500).json({ error: "Error al obtener los cursos" });
    }
  },
 // Controlador
async deleteByIdPlantel(req, res) {
  try {
    const { idPlantel } = req.params; // Extraer el ID del plantel desde los parámetros

    // Llamar al modelo para eliminar los cursos asociados al plantel
    const cursosEliminados = await PlantelesCursosModel.eliminarCursosPorPlantel(idPlantel);

    // Verificar si se eliminaron registros
    if (cursosEliminados.rowCount === 0) {
      return res.status(404).json({ error: "No se encontraron cursos para este plantel" });
    }

    // Respuesta en caso de éxito
    res.status(200).json({
      message: "Cursos eliminados correctamente",
      count: cursosEliminados.rowCount,
      deleted: cursosEliminados.rows, // Incluye los registros eliminados si se desea
    });
  } catch (error) {
    console.error("Error al eliminar los cursos:", error);
    res.status(500).json({ error: "Error al eliminar los cursos" });
  }
}
,
// Modelo
async eliminarCursosPorPlantel(plantelId) {
  try {
    const query = `
      DELETE FROM planteles_cursos
      WHERE plantel_id = $1
      RETURNING *;
    `;

    const values = [plantelId];
    const { rowCount, rows } = await pool.query(query, values);

    // Retornar la cantidad de filas eliminadas y los registros eliminados
    return { rowCount, rows };
  } catch (error) {
    console.error("Error al eliminar cursos por plantel:", error);
    throw error; // Lanza el error para manejarlo en el nivel superior
  }
},
async registrarSolicitud(req, res) {
  try {
    // Llamar al modelo para registrar la solicitud
    const nuevaSolicitud = await PlantelesCursosModel.registrarSolicitud(req.body);

    // Imprimir los datos de la solicitud para depuración
    console.log('Solicitud registrada exitosamente:', nuevaSolicitud);

    // Responder con los datos registrados
    res.status(201).json({
      message: 'Solicitud registrada exitosamente',
      data: nuevaSolicitud,
    });
  } catch (error) {
    console.error('Error al registrar la solicitud:', error);

    // Enviar respuesta de error
    res.status(500).json({
      message: 'Error al registrar la solicitud',
      error: error.message,
    });
  }
},
  async obtenerSolicitudes(req, res) {
    try {
      const solicitudes = await PlantelesCursosModel.obtenerSolicitudes();
      res.status(200).json(solicitudes);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Error al obtener las solicitudes",
        error: error.message,
      });
    }
  },
  async actualizarEstatus(req, res) {
    try {
      const { id } = req.params;
      const { estatus, observacion } = req.body;

      const solicitudActualizada = await PlantelesCursosModel.actualizarEstatus(
        id,
        estatus,
        observacion
      );

      if (!solicitudActualizada) {
        return res.status(404).json({
          message: "Solicitud no encontrada",
        });
      }

      res.status(200).json({
        message: "Estatus actualizado correctamente",
        data: solicitudActualizada,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Error al actualizar el estatus",
        error: error.message,
      });
    }
  },
};
