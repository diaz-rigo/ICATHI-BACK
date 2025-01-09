const AreasModel = require('../models/AreasModel');

const AreasController = {
  async getAll(req, res) {
    try {
      const areas = await AreasModel.getAll();
      res.status(200).json(areas);
    } catch (error) {
      console.error('Error al obtener las áreas:', error);
      res.status(500).json({ error: 'Error al obtener las áreas' });
    }
  },
  async getInfoById(req, res) {
    try {
      const {idArea}=req.params;
      const areas = await AreasModel.getAllInfoById(idArea);
      res.status(200).json(areas);
    } catch (error) {
      console.error('Error al obtener las áreas:', error);
      res.status(500).json({ error: 'Error al obtener las áreas' });
    }
  },
  async getAllBydPlantel(req, res) {
    try {

      const{ idPlantel}=req.params;
      const areas = await AreasModel.getAllByIdPlantel(idPlantel);
      res.status(200).json(areas);
    } catch (error) {
      console.error('Error al obtener las áreas:', error);
      res.status(500).json({ error: 'Error al obtener las áreas' });
    }
  },

  
};

module.exports = AreasController;