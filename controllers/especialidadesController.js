const EspecialidadesModel = require('../models/especialidadesModel');

const EspecialidadesController = {
  async getAll(req, res) {
    try {
      const especialidades = await EspecialidadesModel.getAll();
      res.status(200).json(especialidades);
    } catch (error) {
      console.error('Error al obtener las especialidades:', error);
      res.status(500).json({ error: 'Error al obtener las especialidades' });
    }
  },
};

module.exports = EspecialidadesController;