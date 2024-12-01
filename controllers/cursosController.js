const CursosModel = require('../models/cursosModel');
// 
exports.getAll = async (req, res) => {
    try {
        const cursos = await CursosModel.getAll();
        res.status(200).json(cursos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

}

exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const curso = await CursosModel.getById(id);
        if (!curso) {
            return res.status(404).json({ error: 'Curso no encontrado' });
        }
        res.status(200).json(curso);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
exports.create = async (req, res) => {

    try {
        const nuevoCurso = await CursosModel.create(req.body);
        res.status(201).json(nuevoCurso);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
exports.getCursoDetailsById = async (req, res) => {
    try {
        const { id } = req.params;
        const cursoDetalles = await CursosModel.getCursoDetailsById(id);
        if (!cursoDetalles) {
          return res.status(404).json({ message: 'Curso no encontrado' });
        }
        res.status(200).json(cursoDetalles);
      } catch (error) {
        console.error('Error al obtener detalles del curso:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
      }
}

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const cursoActualizado = await CursosModel.update(id, req.body);
        if (!cursoActualizado) {
            return res.status(404).json({ error: 'Curso no encontrado' });
        }
        res.status(200).json(cursoActualizado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const cursoEliminado = await CursosModel.delete(id);
        if (!cursoEliminado) {
            return res.status(404).json({ error: 'Curso no encontrado' });
        }
        res.status(200).json(cursoEliminado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

