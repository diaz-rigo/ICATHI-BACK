// Controlador para manejar las solicitudes
const PlantelesCursosModel = require('../models/planteles_cursosModel');

module.exports = {




  async getByIdPlantel (req, res) {
    try {
      const { idPlantel } = req.params;
  
      // Realiza el INNER JOIN para obtener los cursos del plantel
      const cursos = await PlantelesCursosModel.obtenerCursosPorPlantel(idPlantel);
  
      if (!cursos.length) {
        return res.status(404).json({ error: 'No se encontraron cursos para este plantel' });
      }
  
      res.status(200).json(cursos);
    } catch (error) {
      console.error('Error al obtener los cursos:', error);
      res.status(500).json({ error: 'Error al obtener los cursos' });
    }
  },
  async registrarSolicitud(req, res) {
    try {
      const nuevaSolicitud = await PlantelesCursosModel.registrarSolicitud(req.body);
      res.status(201).json({
        message: 'Solicitud registrada exitosamente',
        data: nuevaSolicitud
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Error al registrar la solicitud',
        error: error.message
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
        message: 'Error al obtener las solicitudes',
        error: error.message
      });
    }
  },
  async actualizarEstatus(req, res) {
    try {
      const { id } = req.params;
      const { estatus, observacion } = req.body;

      const solicitudActualizada = await PlantelesCursosModel.actualizarEstatus(id, estatus, observacion);

      if (!solicitudActualizada) {
        return res.status(404).json({
          message: 'Solicitud no encontrada'
        });
      }

      res.status(200).json({
        message: 'Estatus actualizado correctamente',
        data: solicitudActualizada
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Error al actualizar el estatus',
        error: error.message
      });
    }
  }
};
