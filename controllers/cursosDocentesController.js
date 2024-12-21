const cursosDocentesModel = require("../models/cursosDocentesModel");

module.exports = {
  async asignarCursoDocente(req, res) {
    const { docenteId, cursoId } = req.body;
    console.log(req.body);
    try {
      // Lógica para asignar el docente al curso en el plantel
      // Por ejemplo:
      const result = await cursosDocentesModel.asignarCursoDocente(
        cursoId,
        docenteId
      );
      res.status(200).json({ message: "Docente asignado con éxito", result });
    } catch (error) {
      console.error("Error al asignar docente:", error);
      res.status(500).json({ message: "Error al asignar docente", error });
    }
  },
  // async getAlumnosAndcursoByIdDocente (req, res) {
  //   // async getDocentesByUserId(req, res) {
  //     const { docenteId } = req.params;
    
  //     if (!docenteId) {
  //       return res.status(400).json({ error: 'El ID del usuario es requerido.' });
  //     }
    
  //     try {
  //       const docentes = await DocentesModel.getAlumnosCursoByIdDocente(docenteId);
    
  //       if (docentes.length === 0) {
  //         return res.status(404).json({ message: 'No se encontraron datos de este docente.' });
  //       }
    
  //       return res.status(200).json(docentes);
  //     } catch (error) {
  //       console.error('Error en el controlador al obtener docentes:', error);
  //       return res.status(500).json({ error: 'Error al obtener docentes.' });
  //     }
  //   }
};

