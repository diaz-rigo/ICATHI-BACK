const DocentesModel = require('../models/docentesModel');


// exports.updateDocenteStatus = async (req, res) => {
//   const { estatus_id } = req.body; // Obteniendo el estatus_id del cuerpo de la solicitud
//   const docenteId = req.params.docenteId; // Obteniendo el docenteId de los parámetros de la URL

//   console.log("***", req.body);
  
//   try {
//     const rowCount = await DocentesModel.updateStatus(docenteId, estatus_id);
    
//     if (rowCount === 0) {
//       return res.status(404).json({ message: 'Docente no encontrado' });
//     }

//     res.status(200).json({ message: 'Estatus actualizado correctamente' });
//   } catch (error) {
//     res.status(500).json({ message: 'Error al actualizar el estatus', error: error.message });
//   }
// };

exports.updateDocenteStatus = async (req, res) => {
  const { estatus_id, usuario_validador_id } = req.body; // Obteniendo los datos del cuerpo de la solicitud
  const docenteId = req.params.docenteId; // Obteniendo el docenteId de los parámetros de la URL

  console.log("*** Request Body:", req.body);
  console.log("*** Request Params:", req.params);

  // Validación de parámetros
  if (!docenteId || !estatus_id || !usuario_validador_id) {
    return res.status(400).json({
      message: 'Faltan datos requeridos: docenteId, estatus_id o usuario_validador_id',
    });
  }

  try {
    // Llamando al modelo para actualizar el estatus con el usuario validador
    const resultado = await DocentesModel.updateStatus(docenteId, estatus_id, usuario_validador_id);

    if (!resultado) {
      return res.status(404).json({ message: 'Docente no encontrado' });
    }

    res.status(200).json({
      message: 'Estatus actualizado correctamente',
      data: resultado, // Se incluye el registro actualizado para verificar los cambios
    });
  } catch (error) {
    console.error("Error al actualizar el estatus:", error);
    res.status(500).json({
      message: 'Error interno al actualizar el estatus',
      error: error.message,
    });
  }
};



exports.getDocentesByUserId = async (req, res) => {
// async getDocentesByUserId(req, res) {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: 'El ID del usuario es requerido.' });
  }

  try {
    const docentes = await DocentesModel.getByUserId(userId);

    if (docentes.length === 0) {
      return res.status(404).json({ message: 'No se encontraron docentes para este usuario.' });
    }

    return res.status(200).json(docentes);
  } catch (error) {
    console.error('Error en el controlador al obtener docentes:', error);
    return res.status(500).json({ error: 'Error al obtener docentes.' });
  }
}
exports.getAlumnosAndcursoByIdDocente = async (req, res) => {
// async getDocentesByUserId(req, res) {
  const { docenteId } = req.params;

  if (!docenteId) {
    return res.status(400).json({ error: 'El ID del usuario es requerido.' });
  }

  try {
    const docentes = await DocentesModel.getAlumnosCursoByIdDocente(docenteId);

    if (docentes.length === 0) {
      return res.status(404).json({ message: 'No se encontraron datos de este docente.' });
    }

    return res.status(200).json(docentes);
  } catch (error) {
    console.error('Error en el controlador al obtener docentes:', error);
    return res.status(500).json({ error: 'Error al obtener docentes.' });
  }
}


// 2222222222222222222222222222222222 hacer 
exports.getAll = async (req, res) => {
  try {
    
    const docentes = await DocentesModel.getAll();
    res.status(200).json(docentes);
  } catch (error) {
    console.error('Error al obtener los docentes:', error);
    res.status(500).json({ error: 'Error al obtener los docentes' });
  }
};
exports.getDocenteByIdPlantel = async (req, res) => {
  try {
    const { plantelId } = req.params;
    
    const docentes = await DocentesModel.getDocenteByIdPlantel(plantelId);
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
    // Desestructuramos el id de los parámetros de la URL
    const { id } = req.params;

    // Verificamos si el id está presente
    if (!id) {
      return res.status(400).json({ error: 'ID del docente no proporcionado' });
    }

    // Extraer campos del cuerpo de la solicitud
    const {
      nombre,
      apellidos,
      email,
      telefono,
      especialidades,
      foto_url,
      curriculum_file_url,
      documento_identificacion_file_url,
      cedula_file_url
    } = req.body;

    console.log("<<<<<<<<<<", req.body);

    // Validar campos obligatorios
    if (!nombre || !apellidos || !email) {
      return res.status(400).json({
        error: 'Los campos nombre, apellidos y email son obligatorios'
      });
    }

    // Crear objeto para actualizar solo los campos enviados
    const datosActualizados = {};

    // Solo añadir campos si están definidos
    if (nombre) datosActualizados.nombre = nombre;
    if (apellidos) datosActualizados.apellidos = apellidos;
    if (email) datosActualizados.email = email;
    if (telefono) datosActualizados.telefono = telefono;
    if (especialidades) datosActualizados.especialidades = especialidades;
    if (foto_url) datosActualizados.foto_url = foto_url;
    if (curriculum_file_url) datosActualizados.curriculum_url = curriculum_file_url;
    if (documento_identificacion_file_url) datosActualizados.documento_identificacion = documento_identificacion_file_url;
    if (cedula_file_url) datosActualizados.cedula_profesional = cedula_file_url;

    // Actualizar docente en la base de datos
    const docenteActualizado = await DocentesModel.update(id, datosActualizados);

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

