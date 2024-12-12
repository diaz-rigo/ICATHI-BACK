const AlumnoModel = require('../models/AlumnoModel');

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
