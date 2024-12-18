const AlumnoModel = require('../models/AlumnoModel');
exports.getAlumnoByUserId = async (req, res) => {
    // async getDocentesByUserId(req, res) {
      const { userId } = req.params;
    
      if (!userId) {
        return res.status(400).json({ error: 'El ID del usuario es requerido.' });
      }
    
      try {
        const docentes = await AlumnoModel.getByUserId(userId);
    
        if (docentes.length === 0) {
          return res.status(404).json({ message: 'No se encontraron docentes para este usuario.' });
        }
    
        return res.status(200).json(docentes);
      } catch (error) {
        console.error('Error en el controlador al obtener docentes:', error);
        return res.status(500).json({ error: 'Error al obtener docentes.' });
      }
    }
exports.getAll = async (req, res) => {
    try {
        const alumnos = await AlumnoModel.getAll();
        res.status(200).json(alumnos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener alumnos' });
    }

}
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;
        const alumno = await AlumnoModel.getById(id);
        if (!alumno) {
            return res.status(404).json({ message: 'Alumno no encontrado' });
        }
        res.status(200).json(alumno);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener alumno' });
    }

}

exports.create = async (req, res) => {

    try {
        const newAlumno = await AlumnoModel.create(req.body);
        res.status(201).json(newAlumno);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear alumno' });
    }
}

exports.update = async (req, res) => {

    try {
        const { id } = req.params;
        const { nombre, apellidos, ...rest } = req.body;
        const updatedAlumno = await AlumnoModel.update(id, { nombre, apellidos, ...rest });
        res.status(200).json(updatedAlumno);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar alumno' });
    }
}
exports.delete = async (req, res) => {


    try {
        const { id } = req.params;
        await AlumnoModel.delete(id);
        res.status(200).json({ message: 'Alumno eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar alumno' });
    }
}
