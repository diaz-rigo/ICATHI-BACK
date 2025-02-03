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
  // async asignarCursoDocente(cursoId, docenteId) {
  //   // Formatear la fecha de asignación
  //   const fechaAsignacion = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  //   const query = `
  //       INSERT INTO cursos_docentes (curso_id, docente_id, fecha_asignacion, estatus)
  //       VALUES ($1, $2, $3, $4) RETURNING *`;

  //   // Ejecutar la consulta con los parámetros
  //   const { rows } = await pool.query(query, [
  //     cursoId,
  //     docenteId,
  //     fechaAsignacion,
  //     true,
  //   ]); // true para estatus

  //   return rows[0]; // Retornar el primer resultado
  // },
  // async asignarODesasignarCursoDocente(cursoId, docenteId, action) { 
  //   const fechaAsignacion = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  //   let query;
  //   let params;
  
  //   if (action === 'asignar') {
  //     // Verificar si ya está asignado un docente al curso y su estatus es true
  //     const checkQuery = `
  //       SELECT * FROM cursos_docentes 
  //       WHERE curso_id = $1 AND docente_id = $2
  //     `;
  //     const { rows } = await pool.query(checkQuery, [cursoId, docenteId]);
  
  //     if (rows.length > 0) {
  //       // Si ya existe y está asignado, actualizamos la fecha de asignación y el estatus
  //       if (rows[0].estatus === true) {
  //         console.log('El docente ya está asignado al curso, actualizando fecha...');
  //         query = `
  //           UPDATE cursos_docentes
  //           SET updated_at = now(), fecha_asignacion = $1
  //           WHERE curso_id = $2 AND docente_id = $3 AND estatus = true
  //           RETURNING *`;
  //         params = [fechaAsignacion, cursoId, docenteId];
  //       } else {
  //         // Si el docente fue desasignado (estatus = false), se actualiza su estatus
  //         console.log('El docente estaba desasignado, reasignando...');
  //         query = `
  //           UPDATE cursos_docentes
  //           SET estatus = true, updated_at = now(), fecha_asignacion = $1
  //           WHERE curso_id = $2 AND docente_id = $3 AND estatus = false
  //           RETURNING *`;
  //         params = [fechaAsignacion, cursoId, docenteId];
  //       }
  //     } else {
  //       // Si no está asignado en la tabla, realizamos la inserción
  //       console.log('Asignando docente al curso...');
  //       query = `
  //         INSERT INTO cursos_docentes (curso_id, docente_id, fecha_asignacion, estatus)
  //         VALUES ($1, $2, $3, $4) RETURNING *`;
  //       params = [cursoId, docenteId, fechaAsignacion, true]; // true para asignar
  //     }
  //   } else if (action === 'desasignar') {
  //     // Lógica para desasignar (cambiar el estatus a false)
  //     console.log('Desasignando docente del curso...');
  //     query = `
  //       UPDATE cursos_docentes
  //       SET estatus = $1, updated_at = now()
  //       WHERE curso_id = $2 AND docente_id = $3 AND estatus = true
  //       RETURNING *`;
  //     params = [false, cursoId, docenteId]; // false para desasignar
  //   }
  
  //   // Ejecutamos la consulta con los parámetros
  //   const result = await pool.query(query, params);
  
  //   if (result.rows.length > 0) {
  //     console.log(`Acción completada: ${action} en el curso ID ${cursoId} para el docente ID ${docenteId}`);
  //     return result.rows[0]; // Retorna el primer resultado
  //   } else {
  //     console.log('No se encontró ningún registro para actualizar o insertar.');
  //     return { message: 'No se pudo realizar la acción. Verifique los datos proporcionados.' };
  //   }
  // }
  
  
  async asignarODesasignarCursoDocente(cursoId, docentesIds) {
    const results = [];
  
    for (const docenteId of docentesIds) {
      const fechaAsignacion = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
      let query;
      let params;
  
      // Verificar si el docente ya está asignado al curso
      const checkQuery = `
        SELECT * FROM cursos_docentes 
        WHERE curso_id = $1 AND docente_id = $2
      `;
      const { rows } = await pool.query(checkQuery, [cursoId, docenteId]);
  
      if (rows.length > 0) {
        // Si ya está asignado, desasignarlo
        if (rows[0].estatus === true) {
          console.log('Desasignando docente del curso...');
          query = `
            UPDATE cursos_docentes
            SET estatus = $1, updated_at = now()
            WHERE curso_id = $2 AND docente_id = $3 AND estatus = true
            RETURNING *`;
          params = [false, cursoId, docenteId]; // false para desasignar
        } else {
          // Si está desasignado, asignarlo
          console.log('Asignando docente al curso...');
          query = `
            UPDATE cursos_docentes
            SET estatus = $1, updated_at = now(), fecha_asignacion = $2
            WHERE curso_id = $3 AND docente_id = $4 AND estatus = false
            RETURNING *`;
          params = [true, fechaAsignacion, cursoId, docenteId]; // true para asignar
        }
      } else {
        // Si no está en la tabla, asignarlo
        console.log('Asignando docente al curso...');
        query = `
          INSERT INTO cursos_docentes (curso_id, docente_id, fecha_asignacion, estatus)
          VALUES ($1, $2, $3, $4) RETURNING *`;
        params = [cursoId, docenteId, fechaAsignacion, true]; // true para asignar
      }
  
      // Ejecutar la consulta
      const result = await pool.query(query, params);
  
      if (result.rows.length > 0) {
        console.log(`Acción completada para el docente ID ${docenteId}`);
        results.push(result.rows[0]); // Agregar el resultado a la lista
      } else {
        console.log('No se encontró ningún registro para actualizar o insertar.');
        results.push({ message: 'No se pudo realizar la acción. Verifique los datos proporcionados.' });
      }
    }
  
    return results; // Retornar todos los resultados
  }
  
  
,  
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
  async getAssignedCourses(docenteId) {
    const query = `
      SELECT 
        cd.id AS asignacion_id,
        cd.fecha_asignacion,
        cd.estatus AS asignacion_estatus,
        c.id AS curso_id,
        c.nombre AS curso_nombre,
        c.clave AS curso_clave,
        c.duracion_horas AS curso_duracion_horas,
        c.descripcion AS curso_descripcion,
        c.area_id,
        a.nombre AS area_nombre,
        c.especialidad_id,
        e.nombre AS especialidad_nombre,
        c.tipo_curso_id,
        t.nombre AS tipo_curso_nombre,
        c.vigencia_inicio,
        c.fecha_publicacion,
        c.ultima_actualizacion
      FROM cursos_docentes cd
      JOIN cursos c ON cd.curso_id = c.id
      JOIN areas a ON c.area_id = a.id
      JOIN especialidades e ON c.especialidad_id = e.id
      JOIN tipos_curso t ON c.tipo_curso_id = t.id
      WHERE cd.docente_id = $1
    `;
    const { rows } = await pool.query(query, [docenteId]);
    return rows;
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
  }

  // async getDocentesByCursoAndPlantel(idPlantel) {
  //   const query = `
  //     SELECT 
  //       d.id AS docente_id,
  //       d.nombre AS docente_nombre,
  //       d.apellidos,
  //       c.id AS curso_id,
  //       c.nombre AS curso_nombre
  //     FROM cursos_docentes cd
  //     JOIN docentes d ON cd.docente_id = d.id
  //     JOIN cursos c ON cd.curso_id = c.id
  //     JOIN planteles_cursos pc ON c.id = pc.curso_id
  //     WHERE pc.plantel_id = $1 AND pc.estatus = true AND cd.estatus = true;
  //   `;
  //   const { rows } = await pool.query(query, [idPlantel]);
  //   return rows;
  // },
  ,
  async  getDocentesByCursoAndPlantel(idUsuario) {
    // Primero obtenemos el id del plantel asociado al usuario
    const plantelQuery = `
      SELECT id AS plantel_id
      FROM planteles
      WHERE id_usuario = $1 AND estatus = true;
    `;
    const { rows: plantelRows } = await pool.query(plantelQuery, [idUsuario]);
  
    if (plantelRows.length === 0) {
      throw new Error('No se encontró ningún plantel asociado a este usuario.');
    }
  
    const idPlantel = plantelRows[0].plantel_id;
    console.log("idPlantel",idPlantel)
    // Ahora obtenemos los docentes y cursos del plantel
    const docentesQuery = `
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
      WHERE pc.plantel_id = $1 AND cd.estatus = true;
    `;
    const { rows: docentesRows } = await pool.query(docentesQuery, [idPlantel]);
  
    return docentesRows;
  }
,  
  async getAlumnosByCursoId(curso_id) {
  // const query = `
  //   SELECT 
  //     a.id AS alumno_id,
  //   ac.calificacion_final AS calificacion_final,
  //     a.nombre AS alumno_nombre,
  //     a.apellidos AS alumno_apellidos,
  //     c.id AS curso_id,
  //     c.nombre AS curso_nombre,
  //     cd.docente_id,
  //     asis.id AS asistencia_id,
  //     asis.fecha AS asistencia_fecha,
  //     asis.id AS asistencia_id,
  //     asis.total_asistencias AS asistencia,
  //     asis.observaciones AS observaciones
  //   FROM alumnos a
  //   JOIN alumnos_cursos ac ON a.id = ac.alumno_id
  //   JOIN cursos c ON ac.curso_id = c.id
  //   JOIN cursos_docentes cd ON c.id = cd.curso_id
  //   LEFT JOIN asistencias asis ON a.id = asis.alumno_id AND c.id = asis.curso_id AND asis.fecha = CURRENT_DATE
  //   WHERE c.id = $1 AND cd.estatus = true AND ac.estatus = 'Inscrito';
  // `;
  const query = `
    SELECT 
      a.id AS alumno_id,
    ac.calificacion_final AS calificacion_final,
      a.nombre AS alumno_nombre,
      a.apellidos AS alumno_apellidos,
      c.id AS curso_id,
      c.nombre AS curso_nombre,
      cd.docente_id,
      asis.id AS asistencia_id,
      asis.fecha AS asistencia_fecha,
      asis.id AS asistencia_id,
      asis.total_asistencias AS asistencia,
      asis.observaciones AS observaciones
    FROM alumnos a
    JOIN alumnos_cursos ac ON a.id = ac.alumno_id
    JOIN cursos c ON ac.curso_id = c.id
    JOIN cursos_docentes cd ON c.id = cd.curso_id
    LEFT JOIN asistencias asis ON a.id = asis.alumno_id AND c.id = asis.curso_id 
    WHERE c.id = $1 AND cd.estatus = true AND ac.estatus = 'Inscrito';
  `;

  const { rows } = await pool.query(query, [curso_id]);
  return rows;
}, // Nueva función para obtener los docentes de un curso específico
async getDocent_asignadosByCursoId(cursoId) {
    // const query = `
  //   SELECT 
  //     d.id AS docente_id,
  //     d.nombre,
  //     d.apellidos,
  //     d.email,
  //     d.telefono,
  //     d.especialidad,
  //     d.certificado_profesional,
  //     d.cedula_profesional
  //   FROM 
  //     cursos_docentes cd
  //   INNER JOIN 
  //     docentes d ON cd.docente_id = d.id
  //   WHERE 
  //     cd.curso_id = $1 
  //     AND cd.estatus = true; 
  // `;
},
async getDocentesByCursoId(cursoId) {
// obtine a los docentes q
  const query = `
WITH curso_especialidad AS (
  SELECT 
    especialidad_id
  FROM 
    cursos
  WHERE 
    id = $1 -- Aquí se pasa el id del curso como parámetro
),
docentes_especialidad AS (
  SELECT 
    d.id AS docente_id,
    d.nombre,
    d.apellidos,
    d.email,
    d.telefono,
    d.especialidad,
    d.certificado_profesional,
    d.cedula_profesional
  FROM 
    docentes_especialidades de
  INNER JOIN 
    docentes d ON de.docente_id = d.id
  WHERE 
    de.especialidad_id = (SELECT especialidad_id FROM curso_especialidad) 
    AND d.estatus_id = 4 -- Opcional: si tienes un campo de estatus en docentes
)
SELECT 
  docentes_curso.* 
FROM (
  -- Obtenemos los docentes asociados directamente al curso
  SELECT 
    d.id AS docente_id,
    d.nombre,
    d.apellidos,
    d.email,
    d.telefono,
    d.especialidad,
    d.certificado_profesional,
    d.cedula_profesional
  FROM 
    cursos_docentes cd
  INNER JOIN 
    docentes d ON cd.docente_id = d.id
  WHERE 
    cd.curso_id = $1 
    
  UNION
  -- Obtenemos los docentes con la misma especialidad
  SELECT 
    *
  FROM 
    docentes_especialidad
) AS docentes_curso;

  `;
  try {
    const { rows } = await pool.query(query, [cursoId]); // Paso de parámetros seguros
    return rows;
  } catch (error) {
    console.error("Error al obtener docentes por curso ID:", error);
    throw error;
  }
}

};

module.exports = cursosDocentesModel;
