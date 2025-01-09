const pool = require('../config/database'); // Aquí está la conexión con la base de datos

// Función para obtener especialidades de un docente por ID
const obtenerEspecialidadesPorDocente = async (docenteId) => {
    try {
        // Ejecutamos la consulta para obtener las especialidades del docente
        const query = `
            SELECT 
                de.id, 
                de.docente_id, 
                de.especialidad_id, 
                es.nombre AS especialidad,
                de.fecha_validacion,
                de.estatus_id,
                est.valor AS estatus
            FROM docentes_especialidades de
            JOIN especialidades es ON de.especialidad_id = es.id
            LEFT JOIN estatus est ON de.estatus_id = est.id
            WHERE de.docente_id = $1
        `;
        
        // Usamos pool.query en lugar de pool.any
        const { rows } = await pool.query(query, [docenteId]); // rows contiene los resultados de la consulta

        return rows; // Devolvemos las filas resultantes
    } catch (error) {
        // Si ocurre un error, lo lanzamos para que el controlador lo maneje
        throw new Error('Error al obtener las especialidades del docente: ' + error.message);
    }
};
// Función para actualizar el estatus de una especialidad de un docente
const actualizarEstatusEspecialidad = async (docenteId, especialidadId, nuevoEstatusId, usuarioValidadorId) => {
    try {
        // Verificar si el registro existe antes de intentar actualizar
        const existeRegistro = `
            SELECT 1 FROM docentes_especialidades
            WHERE docente_id = $1 AND especialidad_id = $2;
        `;
        const { rows: existe } = await pool.query(existeRegistro, [docenteId, especialidadId]);
        if (existe.length === 0) {
            throw new Error('No se encontró el registro para actualizar.');
        }

        // Consulta SQL para actualizar el registro correspondiente
        const query = `
            UPDATE docentes_especialidades
            SET 
                estatus_id = $1, 
                usuario_validador_id = $2, 
                fecha_validacion = NOW(), 
                updated_at = NOW()
            WHERE 
                docente_id = $3 AND 
                especialidad_id = $4
            RETURNING *;
        `;

        // Ejecutamos la consulta
        const { rows } = await pool.query(query, [nuevoEstatusId, usuarioValidadorId, docenteId, especialidadId]);

        // Validamos si se actualizó algún registro
        if (rows.length === 0) {
            throw new Error('No se encontró el registro para actualizar.');
        }

        // Devolvemos el registro actualizado
        return rows[0];
    } catch (error) {
        console.error('Error en actualizarEstatusEspecialidad:', error);
        throw new Error(`Error al actualizar el estatus: ${error.message}`);
    }
};

module.exports = {
    actualizarEstatusEspecialidad,
    obtenerEspecialidadesPorDocente // Exportamos la función
};
