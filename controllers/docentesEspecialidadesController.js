const {actualizarEstatusEspecialidad} = require('../models/docenteEspecialidadModel');

// Controlador para actualizar el estatus
const actualizarEstatus = async (req, res) => {
    const { docenteId, especialidadId, nuevoEstatusId, usuarioValidadorId } = req.body;
    console.log('Datos recibidos:', req.body);

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
module.exports = {
    actualizarEstatus
};