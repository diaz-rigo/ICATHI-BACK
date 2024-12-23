const pool = require("../config/database");

const cursosDocentesModel = {
  async getAll() {
    const query = `
      SELECT 
        c.id, 
        c.nombre, 
        c.clave,
        c.duracion_horas,
        c.descripcion, -- Incluimos el campo descripcion
        c.area_id,
        a.nombre AS area_nombre,
        c.especialidad_id,
        e.nombre AS especialidad_nombre,
        c.tipo_curso_id,
        c.estatus,
        t.nombre AS tipo_curso_nombre,
        c.vigencia_inicio,
        c.fecha_publicacion,
        c.ultima_actualizacion
      FROM cursos c
      JOIN areas a ON c.area_id = a.id
      JOIN especialidades e ON c.especialidad_id = e.id
      JOIN tipos_curso t ON c.tipo_curso_id = t.id
    `;
    const { rows } = await pool.query(query);
    return rows;
  },
  async asignarCursoDocente(cursoId, docenteId) {
    // Formatear la fecha de asignación
    const fechaAsignacion = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const query = `
        INSERT INTO cursos_docentes (curso_id, docente_id, fecha_asignacion, estatus)
        VALUES ($1, $2, $3, $4) RETURNING *`;

    // Ejecutar la consulta con los parámetros
    const { rows } = await pool.query(query, [
      cursoId,
      docenteId,
      fechaAsignacion,
      true,
    ]); // true para estatus

    return rows[0]; // Retornar el primer resultado
  },
  async getById(id) {
    const query = `
      SELECT 
        c.id, 
        c.nombre, 
        c.clave,
        c.duracion_horas,
        c.descripcion, -- Incluimos el campo descripcion
        c.area_id,
        a.nombre AS area_nombre,
        c.especialidad_id,
        e.nombre AS especialidad_nombre,
        c.tipo_curso_id,
        t.nombre AS tipo_curso_nombre,
        c.vigencia_inicio,
        c.fecha_publicacion,
        c.ultima_actualizacion
      FROM cursos c
      JOIN areas a ON c.area_id = a.id
      JOIN especialidades e ON c.especialidad_id = e.id
      JOIN tipos_curso t ON c.tipo_curso_id = t.id
      WHERE c.id = \$1
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

  async create(curso) {
    const query = `
      INSERT INTO cursos (
        nombre, 
        clave, 
        duracion_horas, 
        descripcion, 
        nivel, -- Incluimos el campo nivel
        area_id, 
        especialidad_id, 
        tipo_curso_id, 
        vigencia_inicio, 
        fecha_publicacion, 
        ultima_actualizacion
      )
      VALUES (\$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8, \$9, \$10, \$11) 
      RETURNING *
    `;
    const values = [
      curso.nombre,
      curso.clave,
      curso.duracion_horas,
      curso.descripcion,
      curso.nivel || "Básico", // Valor predeterminado
      curso.area_id,
      curso.especialidad_id,
      curso.tipo_curso_id,
      curso.vigencia_inicio || null,
      curso.fecha_publicacion || null,
      curso.ultima_actualizacion || null,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async update(id, curso) {
    const query = `
      UPDATE cursos
      SET 
        nombre = \$1,
        clave = \$2,
        duracion_horas = \$3,
        descripcion = \$4, -- Incluimos el campo descripcion
        area_id = \$5,
        especialidad_id = \$6,
        tipo_curso_id = \$7,
        vigencia_inicio = \$8,
        fecha_publicacion = \$9,
        ultima_actualizacion = \$10,
        updated_at = NOW()
      WHERE id = \$11
      RETURNING *
    `;
    const values = [
      curso.nombre,
      curso.clave,
      curso.duracion_horas,
      curso.descripcion, // Aseguramos que este valor no sea null
      curso.area_id,
      curso.especialidad_id,
      curso.tipo_curso_id,
      curso.vigencia_inicio || null,
      curso.fecha_publicacion || null,
      curso.ultima_actualizacion || null,
      id,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async delete(id) {
    const query = "DELETE FROM cursos WHERE id = $1 RETURNING *"; // Consulta para eliminar el curso
    const { rows } = await pool.query(query, [id]); // Ejecuta la consulta con el ID
    return rows[0]; // Devuelve el curso eliminado
  },

  async getDocentesByCursoAndPlantel(idPlantel) {
    const query = `
      SELECT 
        d.id AS docente_id,
        d.nombre AS docente_nombre,
        d.apellidos,
        c.id AS curso_id,
        c.nombre AS curso_nombre
      FROM cursos_docentes cd
      JOIN docentes d ON cd.docente_id = d.id
      JOIN cursos c ON cd.curso_id = c.id
      JOIN planteles_cursos pc ON c.id = pc.curso_id
      WHERE pc.plantel_id = $1 AND pc.estatus = true AND cd.estatus = true;
    `;
    const { rows } = await pool.query(query, [idPlantel]);
    return rows;
  },
};

module.exports = cursosDocentesModel;
