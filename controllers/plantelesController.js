const PlantelesModel = require('../models/plantelesModel');

exports.getAll = async (req, res) => {
  try {
    const planteles = await PlantelesModel.getAll();
    res.status(200).json(planteles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const plantel = await PlantelesModel.getById(id);
    if (!plantel) {
      return res.status(404).json({ error: 'Plantel no encontrado' });
    }
    res.status(200).json(plantel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const nuevoPlantel = await PlantelesModel.create(req.body);
    res.status(201).json(nuevoPlantel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const plantelActualizado = await PlantelesModel.update(id, req.body);
    if (!plantelActualizado) {
      return res.status(404).json({ error: 'Plantel no encontrado' });
    }
    res.status(200).json(plantelActualizado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const plantelEliminado = await PlantelesModel.delete(id);
    if (!plantelEliminado) {
      return res.status(404).json({ error: 'Plantel no encontrado' });
    }
    res.status(200).json(plantelEliminado);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
``
