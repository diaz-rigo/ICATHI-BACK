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

module.exports = {
    obtenerEspecialidadesPorDocente // Exportamos la función
};
