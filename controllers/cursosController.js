
const CursosModel = require('../models/cursosModel');

exports.getAll = async (req, res) => {
  try {
    const cursos = await CursosModel.getAll();
    res.status(200).json(cursos);
  } catch (error) {
    console.error('Error al obtener los cursos:', error);
    res.status(500).json({ error: 'Error al obtener los cursos' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const curso = await CursosModel.getById(id);
    if (!curso) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    res.status(200).json(curso);
  } catch (error) {
    console.error('Error al obtener el curso:', error);
    res.status(500).json({ error: 'Error al obtener el curso' });
  }
};

exports.create = async (req, res) => {
  try {
    console.log('Datos recibidos del frontend:', req.body); // Verifica los datos

    const { nombre, clave, duracion_horas, descripcion, area_id, especialidad_id, tipo_curso_id } = req.body;

    // Validar campos obligatorios
    if (!nombre || !clave || !duracion_horas || !descripcion || !area_id || !especialidad_id || !tipo_curso_id) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben ser completados' });
    }

    const nuevoCurso = await CursosModel.create(req.body);
    res.status(201).json(nuevoCurso);
  } catch (error) {
    console.error('Error al crear el curso:', error);
    res.status(500).json({ error: 'Error al crear el curso' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, clave, duracion_horas, descripcion, area_id, especialidad_id, tipo_curso_id } = req.body;

    // Validar campos obligatorios
    if (!nombre || !clave || !duracion_horas || !descripcion || !area_id || !especialidad_id || !tipo_curso_id) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben ser completados' });
    }

    const cursoActualizado = await CursosModel.update(id, req.body);
    if (!cursoActualizado) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    res.status(200).json(cursoActualizado);
  } catch (error) {
    console.error('Error al actualizar el curso:', error);
    res.status(500).json({ error: 'Error al actualizar el curso' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params; // Obtiene el ID del curso a eliminar
    const cursoEliminado = await CursosModel.delete(id); // Llama al modelo para eliminar el curso

    if (!cursoEliminado) {
      return res.status(404).json({ error: 'Curso no encontrado' }); // Si no se encuentra el curso, devuelve 404
    }

    res.status(200).json(cursoEliminado); // Devuelve el curso eliminado
  } catch (error) {
    console.error('Error al eliminar el curso:', error); // Log del error
    res.status(500).json({ error: 'Error al eliminar el curso' }); // Devuelve un error 500
  }
};


