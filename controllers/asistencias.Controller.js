const AsistenciasModel = require('../models/Asistencias_AlumnosModel');

const AsistenciasController = {
  // Obtener todas las asistencias
  async getAll(req, res) {
    try {
      const asistencias = await AsistenciasModel.getAll();
      res.json(asistencias);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Obtener una asistencia por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const asistencia = await AsistenciasModel.getById(id);
      if (!asistencia) {
        return res.status(404).json({ message: 'Asistencia no encontrada' });
      }
      res.json(asistencia);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Crear una nueva asistencia
  async create(req, res) {
    try {
      const newAsistencia = req.body;
      const asistencia = await AsistenciasModel.create(newAsistencia);
      res.status(201).json(asistencia);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Actualizar una asistencia
  async update(req, res) {
    try {
      const { id } = req.params;
      const updatedAsistencia = req.body;
      const asistencia = await AsistenciasModel.update(id, updatedAsistencia);
      if (!asistencia) {
        return res.status(404).json({ message: 'Asistencia no encontrada' });
      }
      res.json(asistencia);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Eliminar una asistencia
  async delete(req, res) {
    try {
      const { id } = req.params;
      const asistencia = await AsistenciasModel.delete(id);
      if (!asistencia) {
        return res.status(404).json({ message: 'Asistencia no encontrada' });
      }
      res.json({ message: 'Asistencia eliminada exitosamente' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = AsistenciasController;
