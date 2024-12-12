const DocentesModel = require('../models/docentesModel');

exports.getAll = async (req, res) => {
  try {
    const docentes = await DocentesModel.getAll();
    res.status(200).json(docentes);
  } catch (error) {
    console.error('Error al obtener los docentes:', error);
    res.status(500).json({ error: 'Error al obtener los docentes' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const docente = await DocentesModel.getById(id);
    if (!docente) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }
    res.status(200).json(docente);
  } catch (error) {
    console.error('Error al obtener el docente:', error);
    res.status(500).json({ error: 'Error al obtener el docente' });
  }
};

exports.create = async (req, res) => {
  try {
    console.log('Datos recibidos del frontend:', req.body);

    // Extraer campos del cuerpo de la solicitud
    const {
      nombre,
      apellidos,
      email,
      telefono,
      especialidad,
      certificado_profesional,
      cedula_profesional,
      documento_identificacion,
      num_documento_identificacion,
      curriculum_url,
      estatus,
      usuario_validador_id,
      fecha_validacion,
      foto_url
    } = req.body;

    // Validar campos obligatorios
    if (!nombre || !apellidos || !email) {
      return res.status(400).json({ error: 'Los campos nombre, apellidos y email son obligatorios' });
    }

    const nuevoDocente = await DocentesModel.create(req.body);
    res.status(201).json(nuevoDocente);
  } catch (error) {
    console.error('Error al crear el docente:', error);
    res.status(500).json({ error: 'Error al crear el docente' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    // Extraer campos del cuerpo de la solicitud
    const {
      nombre,
      apellidos,
      email,
      telefono,
      especialidad,
      certificado_profesional,
      cedula_profesional,
      documento_identificacion,
      num_documento_identificacion,
      curriculum_url,
      estatus,
      usuario_validador_id,
      fecha_validacion,
      foto_url
    } = req.body;

    // Validar campos obligatorios
    if (!nombre || !apellidos || !email) {
      return res.status(400).json({ error: 'Los campos nombre, apellidos y email son obligatorios' });
    }

    const docenteActualizado = await DocentesModel.update(id, req.body);
    if (!docenteActualizado) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }
    res.status(200).json(docenteActualizado);
  } catch (error) {
    console.error('Error al actualizar el docente:', error);
    res.status(500).json({ error: 'Error al actualizar el docente' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const docenteEliminado = await DocentesModel.delete(id);

    if (!docenteEliminado) {
      return res.status(404).json({ error: 'Docente no encontrado' });
    }

    res.status(200).json(docenteEliminado);
  } catch (error) {
    console.error('Error al eliminar el docente:', error);
    res.status(500).json({ error: 'Error al eliminar el docente' });
  }
};