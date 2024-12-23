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
  async getAllDocenteByIdPlantel(req, res) {
    const { plantelId } = req.params;
  
    if (!plantelId) {
      return res.status(400).json({ message: "El plantelId es requerido" });
    }
  
    try {
      console.log("Plantel ID recibido:", plantelId);
  
      // Llamada al modelo para obtener los docentes relacionados con el plantel
      const docentes = await cursosDocentesModel.getDocentesByCursoAndPlantel(plantelId);
  
      if (!docentes || docentes.length === 0) {
        return res.status(404).json({ message: "No se encontraron docentes para el plantel especificado" });
      }
  
      res.status(200).json({
        message: "Docentes obtenidos con éxito",
        data: docentes,
      });
    } catch (error) {
      console.error("Error al obtener docentes:", error);
      res.status(500).json({ message: "Error al obtener docentes", error: error.message });
    }
  }
  
  // async getAllDocenteByIdPlantel (req, res) {
  //   // async getDocentesByUserId(req, res) {
  //     const { idPlantel } = req.params;
    
  //     if (!docenteId) {
  //       return res.status(400).json({ error: 'El ID del usuario es requerido.' });
  //     }
    
  //     try {
  //       const docentes = await DocentesModel.getDocentesByCursoAndPlantel(idPlantel);
    
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

