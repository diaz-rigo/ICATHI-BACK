const EspecialidadesModel = require('../models/especialidadesModel');
const { pool } = require('../config/database'); // Conexión a la base de datos

const docenteEspecialidadModel = require('../models/docenteEspecialidadModel');

// Obtener todas las especialidades
exports.getAll = async (req, res) => {
// const EspecialidadesController = {
  // async getAll(req, res) {
    try {
      const especialidades = await EspecialidadesModel.getAll();
      res.status(200).json(especialidades);
    } catch (error) {
      console.error('Error al obtener las especialidades:', error);
      res.status(500).json({ error: 'Error al obtener las especialidades' });
    }
  },

  async getEspecialidadesByAreaId(req,res) {
    try {
      const areaId = Number(req.params.areaId);
      const especialidades = await EspecialidadesModel.getEspecialidadesByAreaId(areaId);
      res.status(200).json(especialidades);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener las especialidades' });
    }
  }


};

module.exports = EspecialidadesController;
  // }
// };
}
// module.exports = EspecialidadesController;







// Asociar especialidades a un docente
exports.associateEspecialidades = async (req, res) => {
    const { docenteId } = req.params;
    const { especialidadIds } = req.body; // Array de IDs de especialidades
    try {
        const queries = especialidadIds.map(id => pool.query(
            `INSERT INTO docentes_especialidades (docente_id, especialidad_id) 
             VALUES ($1, $2) ON CONFLICT (docente_id, especialidad_id) DO NOTHING`,
            [docenteId, id]
        ));
        await Promise.all(queries);
        res.status(201).send('Especialidades asociadas correctamente');
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Validar una especialidad de un docente
exports.validateEspecialidad = async (req, res) => {
    const { docenteId, especialidadId } = req.params;
    const usuarioValidadorId = req.user.id; // Supongamos que tenemos un middleware que da `req.user`
    try {
        await pool.query(
            `UPDATE docentes_especialidades 
             SET validada = true, usuario_validador_id = $1, fecha_validacion = now()
             WHERE docente_id = $2 AND especialidad_id = $3`,
            [usuarioValidadorId, docenteId, especialidadId]
        );
        res.send('Especialidad validada correctamente');
    } catch (error) {
        res.status(500).send(error.message);
    }
};


exports.obtenerEspecialidadesPorDocente = async (req, res) => {
  // Función para manejar la consulta de especialidades por docente
  // const obtenerEspecialidadesPorDocente = async (req, res) => {
      const docenteId = req.params.docente_id; // Obtenemos el ID del docente desde los parámetros de la URL
  
      try {
          // Llamamos a la función del modelo para obtener las especialidades del docente
          const especialidades = await docenteEspecialidadModel.obtenerEspecialidadesPorDocente(docenteId);
          
          // Si no se encontraron especialidades, devolvemos un 404
          if (especialidades.length === 0) {
              return res.status(404).json({ mensaje: 'No se encontraron especialidades para este docente.' });
          }
          
          // Devolvemos las especialidades encontradas
          res.status(200).json({ especialidades });
      } catch (error) {
          console.error(error); // Mostramos el error en la consola para debugging
          res.status(500).json({ mensaje: 'Error en el servidor. No se pudieron obtener las especialidades.' });
      }
  };
  