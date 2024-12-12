const CursosModel = require('../models/cursosModel');
const PlantelesCursos = require('../models/planteles_cursosModel'); // Suponiendo que tienes un modelo para la tabla de relación
// const CursoDocentes = require('../model/C'); // Suponiendo que tienes un modelo para la tabla de relación
const pool = require('../config/database'); // Importa la instancia de Sequelize



exports.create = async (req, res) => {
  try {
    console.log('Datos recibidos del frontend:', req.body);

    // Extraer campos del cuerpo de la solicitud
    const {
      nombre,
      clave,
      duracion_horas,
      descripcion,
      area_id,
      especialidad_id,
      tipo_curso_id,
      plantel_id
    } = req.body;

    // Validar campos obligatorios
    if (!nombre || !clave || !duracion_horas || !descripcion || !area_id || !especialidad_id || !tipo_curso_id || !plantel_id) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben ser completados' });
    }

    // Crear el curso en la base de datos
    const nuevoCurso = await CursosModel.create({
      nombre,
      clave,
      duracion_horas,
      descripcion,
      area_id,
      especialidad_id,
      tipo_curso_id
    });

    // Crear la relación curso-plantel
    const nuevaRelacionPlantelCurso = await PlantelesCursos.registrarSolicitud({
      curso_id: nuevoCurso.id,  // Asumiendo que el ID del curso se devuelve después de la inserción
      plantel_id
    });

    // Confirmar operación
    res.status(201).json({
      mensaje: 'Curso creado con éxito y relación con el plantel registrada',
      curso_id: nuevoCurso.id,
      plantelcurso_id: nuevaRelacionPlantelCurso.id
    });
  } catch (error) {
    console.error('Error al crear el curso o la relación:', error);
    res.status(500).json({ error: 'Error al crear el curso o la relación con el plantel' });
  }
};



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






exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, clave, duracion_horas, descripcion, area_id, especialidad_id, tipo_curso_id } = req.body;

    // Validar campos obligatorios
    if (!nombre || !clave || !duracion_horas || !descripcion || !area_id || !especialidad_id || !tipo_curso_id) {
      return res.status(400).json({ error: 'Todos los campos obligatorios deben ser completados' });
    }

    const cursoActualizado = await CursosModel.update(req.body, { where: { id } });
    if (!cursoActualizado[0]) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }
    res.status(200).json({ mensaje: 'Curso actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar el curso:', error);
    res.status(500).json({ error: 'Error al actualizar el curso' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const cursoEliminado = await CursosModel.destroy({ where: { id } });

    if (!cursoEliminado) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    res.status(200).json({ mensaje: 'Curso eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar el curso:', error);
    res.status(500).json({ error: 'Error al eliminar el curso' });
  }
};
