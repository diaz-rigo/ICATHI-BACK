const { actualizarEstatusEspecialidad, obtenerDocentesPorEspecialidad } = require('../models/docenteEspecialidadModel');

// Controlador para actualizar el estatus
const actualizarEstatus = async (req, res) => {
    const { docenteId, especialidadId, nuevoEstatusId, usuarioValidadorId } = req.body;

    try {
        // Llamamos a la función para actualizar el estatus
        const resultado = await actualizarEstatusEspecialidad(docenteId, especialidadId, nuevoEstatusId, usuarioValidadorId);

        // Respondemos con el registro actualizado
        res.status(200).json({
            message: 'Estatus actualizado correctamente',
            data: resultado
        });
    } catch (error) {
        // En caso de error, respondemos con el mensaje de error
        res.status(500).json({
            message: error.message
        });
    }
};

// Controlador para obtener docentes por especialidad
const obtenerDocentesPorEspecialidadHandler = async (req, res) => {
    // const { especialidadId } = req.params; // Obtener ID de la especialidad desde la URL
    console.log("Parámetros recibidos:", req.params); // 🔍 Depuración
    console.log("Parámetros recibidos:", req.params); // Depuración

    let { especialidadId } = req.params; 

    // Asegurar que especialidadId sea un número
    especialidadId = parseInt(especialidadId, 10); 
    try {
        // Llamamos a la función del modelo para obtener los docentes
        const resultado = await obtenerDocentesPorEspecialidad(especialidadId);

        // Verificamos si hay datos
        if (resultado.length === 0) {
            return res.status(404).json({ message: "No se encontraron docentes con esta especialidad y estatus 2." });
        }

        // Enviamos los resultados
        res.status(200).json({
            message: 'Docentes obtenidos correctamente',
            data: resultado
        });
    } catch (error) {
        // En caso de error, respondemos con el mensaje de error
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    actualizarEstatus,
     obtenerDocentesPorEspecialidadHandler
};
