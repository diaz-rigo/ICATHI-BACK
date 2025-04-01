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
    console.error('Error al crear el plantel:', error);
    if (error.message === 'El correo electrónico ya está registrado en el sistema') {
      // Si el correo ya está registrado, enviamos un mensaje más específico
      res.status(400).json({ message: 'El correo electrónico ya está registrado en el sistema' });
    } else {
      // Otro tipo de error
      res.status(500).json({ message: 'Ocurrió un error en el servidor' });
    }
  }
};



exports.update = async (req, res) => {
  try {
    console.log("data=>",req.body)
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

    // Intentamos eliminar el plantel
    const plantelEliminado = await PlantelesModel.delete(id);

    // Verificamos si el plantel fue eliminado correctamente
    if (!plantelEliminado) {
      return res.status(404).json({ error: 'El plantel no existe o ya fue eliminado' });
    }

    // Si la eliminación fue exitosa, retornamos un mensaje de éxito
    res.status(200).json({ message: 'Plantel y usuario eliminados correctamente' });

  } catch (error) {
    // Si ocurre un error en el proceso
    console.error('Error al eliminar el plantel:', error); // Para depurar
    res.status(500).json({ error: error.message });
  }
};

exports.getPlantelDetails = async (req, res) => {
// async getPlantelDetails(req, res) {
  const { id } = req.params;
  try {
    const plantelDetails = await PlantelesModel.getPlantelDetails(id);
    if (!plantelDetails) {
      return res.status(404).json({ error: 'Plantel no encontrado' });
    }
    res.status(200).json(plantelDetails);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los detalles del plantel' });
  }
};



exports.getCursosByPlantelId = async (req, res) => {
// async getCursosByPlantelId(req, res) {
  try {
    const { id } = req.params; // Obtener el ID del plantel desde los parámetros de la ruta
    const cursos = await PlantelesModel.getCursosByPlantelId(id);
    if (cursos.length === 0) {
      return res.status(404).json({ message: 'No se encontraron cursos para el plantel especificado.' });
    }
    return res.status(200).json(cursos);
  } catch (error) {
    console.error('Error al obtener los cursos:', error);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
}