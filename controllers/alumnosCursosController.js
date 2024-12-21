const pool = require('../config/database'); // Configuración de conexión a la base de datos

const alumnosCursosController = {
    // Obtener todos los registros de un alumno
    getAllByAlumno: async (req, res) => {
        try {
            const { alumnoId } = req.params;

//             const result = await pool.query(
//                 // `SELECT * FROM alumnos_cursos WHERE alumno_id = $1`,
//                 `
//                 SELECT 
//     ac.id,
//     ac.alumno_id,
//     ac.curso_id,
//     ac.plantel_id, -- Incluí el plantel_id directamente desde alumnos_cursos
//     ac.fecha_inscripcion,
//     ac.progreso,
//     ac.calificacion_final,
//     ac.estatus,
//     p.nombre AS nombre_plantel,
//     p.direccion,
//     p.telefono,
//     p.email,
//     p.director,
//     p.capacidad_alumnos,
//     p.estado,
//     p.municipio,
//     pc.id AS plantel_curso_id,
//     pc.horario,
//     pc.cupo_maximo,
//     pc.requisitos_extra,
//     pc.fecha_inicio,
//     pc.fecha_fin,
//     pc.estatus AS estatus_plantel_curso,
//     pc.temario_url,
//     c.nombre AS nombre_curso,
//     c.descripcion AS descripcion_curso,
//     c.duracion_horas,
//     c.nivel,
//     c.costo,
//     c.modalidad,
//     c.requisitos AS requisitos_curso,
//     c.fecha_publicacion,
//     c.vigencia_inicio
// FROM 
//     alumnos_cursos ac
// JOIN 
//     planteles p ON ac.plantel_id = p.id 
// JOIN 
//     planteles_cursos pc ON ac.curso_id = pc.curso_id AND ac.plantel_id = pc.plantel_id
// JOIN 
//     cursos c ON ac.curso_id = c.id
// WHERE 
//     ac.alumno_id =$1; 



// `,

            const result = await pool.query(
                // `SELECT * FROM alumnos_cursos WHERE alumno_id = $1`,
                `
SELECT 
    ac.id,
    ac.alumno_id,
    ac.curso_id,
    ac.plantel_id, -- Incluí el plantel_id directamente desde alumnos_cursos
    ac.fecha_inscripcion,
    ac.progreso,
    ac.calificacion_final,
    ac.estatus,
    p.nombre AS nombre_plantel,
    p.direccion,
    p.telefono,
    p.email,
    p.director,
    p.capacidad_alumnos,
    p.estado,
    p.municipio,
    pc.id AS plantel_curso_id,
    pc.horario,
    pc.cupo_maximo,
    pc.requisitos_extra,
    pc.fecha_inicio,
    pc.fecha_fin,
    pc.estatus AS estatus_plantel_curso,
    pc.temario_url,
    c.nombre AS nombre_curso,
    c.descripcion AS descripcion_curso,
    c.duracion_horas,
    c.nivel,
    c.costo,
    c.modalidad,
    c.requisitos AS requisitos_curso,
    c.fecha_publicacion,
    c.vigencia_inicio,
    d.id AS docente_id,
    d.nombre AS nombre_docente,
    d.apellidos AS apellido_docente,
    d.email AS email_docente,
    d.telefono AS telefono_docente
FROM 
    alumnos_cursos ac
JOIN 
    planteles p ON ac.plantel_id = p.id 
JOIN 
    planteles_cursos pc ON ac.curso_id = pc.curso_id AND ac.plantel_id = pc.plantel_id
JOIN 
    cursos c ON ac.curso_id = c.id
LEFT JOIN 
    cursos_docentes cd ON c.id = cd.curso_id
LEFT JOIN 
    docentes d ON cd.docente_id = d.id
WHERE 
    ac.alumno_id = $1;

`,
            
[alumnoId]

            );
            res.status(200).json(result.rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Obtener detalles de un curso específico
    getByAlumnoAndCurso: async (req, res) => {
        try {
            const { alumnoId, cursoId } = req.params;
            const result = await pool.query(
                `SELECT * FROM alumnos_cursos WHERE alumno_id = $1 AND curso_id = $2`,
                [alumnoId, cursoId]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ message: "Registro no encontrado" });
            }
            res.status(200).json(result.rows[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Crear un nuevo registro
    create: async (req, res) => {
        try {
            const { alumno_id, curso_id, plantel_id, estatus } = req.body;
            const result = await pool.query(
                `INSERT INTO alumnos_cursos (alumno_id, curso_id, plantel_id, estatus)
                 VALUES ($1, $2, $3, $4) RETURNING *`,
                [alumno_id, curso_id, plantel_id, estatus]
            );
            res.status(201).json(result.rows[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Actualizar un registro (progreso o calificación)
    update: async (req, res) => {
        try {
            const { id } = req.params;
            const { progreso, calificacion_final, estatus } = req.body;
            const result = await pool.query(
                `UPDATE alumnos_cursos
                 SET progreso = $1, calificacion_final = $2, estatus = $3, updated_at = NOW()
                 WHERE id = $4 RETURNING *`,
                [progreso, calificacion_final, estatus, id]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ message: "Registro no encontrado" });
            }
            res.status(200).json(result.rows[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Eliminar un registro
    delete: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await pool.query(
                `DELETE FROM alumnos_cursos WHERE id = $1 RETURNING *`,
                [id]
            );
            if (result.rows.length === 0) {
                return res.status(404).json({ message: "Registro no encontrado" });
            }
            res.status(200).json({ message: "Registro eliminado" });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
};

module.exports = alumnosCursosController;
