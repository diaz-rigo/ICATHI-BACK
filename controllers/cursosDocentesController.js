const cursosDocentesModel = require("../models/cursosDocentesModel");

module.exports = {
 async asignarCursoDocente(req, res) {
    const { docenteId, cursoId } = req.body;
  console.log(req.body)
    try {
      // Lógica para asignar el docente al curso en el plantel
      // Por ejemplo:
      const result = await cursosDocentesModel.asignarCursoDocente(cursoId, docenteId);
      res.status(200).json({ message: 'Docente asignado con éxito', result });
    } catch (error) {
      console.error('Error al asignar docente:', error);
      res.status(500).json({ message: 'Error al asignar docente', error });
    }
  }
}