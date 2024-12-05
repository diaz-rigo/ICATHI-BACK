const TiposCursoModel = require('../models/tiposCursoModel');

const TiposCursoController = {
  async getAll(req, res) {
    try {
      const tiposCurso = await TiposCursoModel.getAll();
      res.status(200).json(tiposCurso);
    } catch (error) {
      console.error('Error al obtener los tipos de curso:', error);
      res.status(500).json({ error: 'Error al obtener los tipos de curso' });
    }
  },
};

module.exports = TiposCursoController;