const pool = require("../config/database");

const PlantelesCursos = {
  async solicitaCurso(req, res) {
    try {
      console.log("Datos recibidos del frontend:", req.body);

      // Extraer campos del cuerpo de la solicitud
      const {
        nombre,
        clave,
        duracion_horas,
        descripcion,
        area_id,
        especialidad_id,
        tipo_curso_id,
        plantel_id,
      } = req.body;

      // Validar campos obligatorios
      if (
        !nombre ||
        !clave ||
        !duracion_horas ||
        !descripcion ||
        !area_id ||
        !especialidad_id ||
        !tipo_curso_id ||
        !plantel_id
      ) {
        return res.status(400).json({
          error: "Todos los campos obligatorios deben ser completados",
        });
      }

      // Crear el curso en la base de datos
      const nuevoCurso = await CursosModel.create({
        nombre,
        clave,
        duracion_horas,
        descripcion,
        area_id,
        especialidad_id,
        tipo_curso_id,
      });

      // Crear la relación curso-plantel
      const nuevaRelacionPlantelCurso =
        await PlantelesCursos.registrarSolicitud({
          curso_id: nuevoCurso.id, // Asumiendo que el ID del curso se devuelve después de la inserción
          plantel_id,
        });

      // Confirmar operación
      res.status(201).json({
        mensaje: "Curso creado con éxito y relación con el plantel registrada",
        curso_id: nuevoCurso.id,
        plantelcurso_id: nuevaRelacionPlantelCurso.id,
      });
    } catch (error) {
      console.error("Error al crear el curso o la relación:", error);
      res.status(500).json({
        error: "Error al crear el curso o la relación con el plantel",
      });
    }
  },
  async registrarSolicitud(data) {
    const {
      plantelId,
      curso_id,
      horario,
      cupo_maximo,
      requisitos_extra,
      fecha_inicio,
      fecha_fin
    } = data;

    const query = `
        INSERT INTO planteles_cursos (plantel_id, curso_id, horario, cupo_maximo, requisitos_extra, fecha_inicio, fecha_fin)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
    `;
    const values = [
      plantelId,
      curso_id,
      horario,
      cupo_maximo,
      requisitos_extra,
      fecha_inicio,
      fecha_fin
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },
  async obtenerSolicitudes() {
    const query = "SELECT * FROM planteles_cursos;";
    const { rows } = await pool.query(query);
    return rows;
  },

  async actualizarEstatus(id, estatus, observacion = null) {
    const query = `
        UPDATE planteles_cursos
        SET estatus = \$1, requisitos_extra = COALESCE(\$2, requisitos_extra), updated_at = now()
        WHERE id = \$3
        RETURNING *;
    `;

    const values = [estatus, observacion, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

async obtenerCursosPorPlantel(plantelId) {
  const query = `
      SELECT 
          pc.id AS id,
          pc.plantel_id AS plantel_id,
          pc.curso_id AS curso_id,
          pc.horario AS horario,
          pc.cupo_maximo AS cupo_maximo,
          pc.requisitos_extra AS requisitos_extra,
          pc.fecha_inicio AS fecha_inicio,
          pc.fecha_fin AS fecha_fin,
          pc.estatus AS estatus,
          pc.temario_url AS temario_url,
          p.nombre AS plantel_nombre,
          c.nombre AS curso_nombre
      FROM 
          planteles_cursos pc
      JOIN 
          planteles p ON pc.plantel_id = p.id
      JOIN 
          cursos c ON pc.curso_id = c.id
      WHERE 
          p.id = \$1;  -- Filtrar por el ID del plantel
  `;

  const values = [plantelId];
  const { rows } = await pool.query(query, values);
  return rows;
},
async obtenerCursoPorId(cursoId) {
  const query = `
      SELECT 
          pc.id AS id,
          pc.plantel_id AS plantel_id,
          pc.curso_id AS curso_id,
          pc.horario AS horario,
          pc.cupo_maximo AS cupo_maximo,
          pc.requisitos_extra AS requisitos_extra,
          pc.fecha_inicio AS fecha_inicio,
          pc.fecha_fin AS fecha_fin,
          pc.estatus AS estatus,
          pc.temario_url AS temario_url,
          p.nombre AS plantel_nombre,
          c.nombre AS curso_nombre
      FROM 
          planteles_cursos pc
      JOIN 
          planteles p ON pc.plantel_id = p.id
      JOIN 
          cursos c ON pc.curso_id = c.id
      WHERE 
          pc.id = \$1;  -- Filtrar por el ID del curso
  `;

  const values = [cursoId];
  const { rows } = await pool.query(query, values);
  return rows[0]; // Devuelve solo un curso
},
  // Modelo

  async eliminarCursosPorPlantel(plantelId) {
    try {
      // Primero, eliminamos el curso del plantel
      const deleteCursosQuery = `
        DELETE FROM planteles_cursos
        WHERE id = $1
        RETURNING curso_id;
      `;
      
      const values = [plantelId];
      const { rowCount, rows: deletedCursos } = await pool.query(deleteCursosQuery, values);
  
      // Si se eliminaron cursos, procedemos a eliminar las relaciones en cursos_docentes
      if (rowCount > 0) {
        const cursoIds = deletedCursos.map(curso => curso.curso_id);
  
        const deleteDocentesQuery = `
          DELETE FROM cursos_docentes
          WHERE curso_id = ANY($1::int[])
          RETURNING *;
        `;
  
        const { rowCount: deletedDocentesCount, rows: deletedDocentes } = await pool.query(deleteDocentesQuery, [cursoIds]);
  
        // Retornar la cantidad de filas eliminadas y los registros eliminados
        return {
          deletedCursosCount: rowCount,
          deletedCursos: deletedCursos,
          deletedDocentesCount: deletedDocentesCount,
          deletedDocentes: deletedDocentes
        };
      }
  
      // Si no se eliminaron cursos, retornar solo un mensaje
      return { message: "No se encontraron cursos para eliminar." };
  
    } catch (error) {
      console.error("Error al eliminar cursos por plantel:", error);
      throw error; // Lanza el error para manejarlo en el nivel superior
    }
  },  
  async obtenerPlantelesConCursosValidados() {
    const query = `
        SELECT 
            pc.id AS id,
            p.id AS plantel_id,
            p.nombre AS plantel_nombre,
            c.id AS curso_id,
            c.nombre AS curso_nombre,
            pc.estatus AS curso_validado
        FROM 
            planteles_cursos pc
        JOIN 
            planteles p ON pc.plantel_id = p.id
        JOIN 
            cursos c ON pc.curso_id = c.id
        WHERE 
            pc.estatus = true;  -- Solo cursos validados
    `;

    const { rows } = await pool.query(query);
    return rows;
  },

  async obtenerPlantelesConCursosNoValidados() {
    const query = `
        SELECT 
            pc.id AS id,
            p.id AS plantel_id,
            p.nombre AS plantel_nombre,
            c.id AS curso_id,
            c.nombre AS curso_nombre,
            pc.estatus AS curso_validado
        FROM 
            planteles_cursos pc
        JOIN 
            planteles p ON pc.plantel_id = p.id
        JOIN 
            cursos c ON pc.curso_id = c.id
        WHERE 
            pc.estatus = false;  -- Solo cursos no validados
    `;

    const { rows } = await pool.query(query);
    return rows;
  },
  async obtenerInfoPlantelCurso(idPlantelCurso) {
    try {
      const query = `
      SELECT
  pc.id AS plantel_curso_id,
  p.id AS plantel_id,
  p.nombre AS plantel_nombre,
  c.id AS curso_id,
  c.nombre AS curso_nombre,
  COALESCE(a.id, 0) AS alumno_id,
  COALESCE(a.nombre, 'No hay alumnos inscritos en este curso') AS alumno_nombre,
  COALESCE(a.apellidos, '') AS alumno_apellidos,
  COALESCE(a.email, '') AS alumno_email,
  COALESCE(a.telefono, '') AS alumno_telefono,
  COALESCE(d.id, 0) AS docente_id,
  COALESCE(d.nombre, 'No hay docente asignado') AS docente_nombre,
  COALESCE(d.apellidos, '') AS docente_apellidos,
  COALESCE(d.email, '') AS docente_email,
  COALESCE(d.telefono, '') AS docente_telefono,
  e.nombre AS especialidad,
  c.area_id,
  ars.nombre AS area_nombre,
  pc.fecha_inicio,
  pc.fecha_fin,
  c.especialidad_id,
  e.nombre AS especialidad_nombre
FROM
  planteles_cursos pc
  JOIN planteles p ON pc.plantel_id = p.id
  JOIN cursos c ON pc.curso_id = c.id
  LEFT JOIN alumnos_cursos ac ON pc.curso_id = ac.curso_id AND pc.plantel_id = ac.plantel_id
  LEFT JOIN alumnos a ON ac.alumno_id = a.id
  LEFT JOIN docentes_especialidades de ON c.especialidad_id = de.especialidad_id
  LEFT JOIN docentes d ON de.docente_id = d.id
  JOIN especialidades e ON de.especialidad_id = e.id
  JOIN areas ars ON ars.id = c.area_id
WHERE
  pc.id = $1
      `;
      const values = [idPlantelCurso];
      const { rows } = await pool.query(query, values);
      const alumnosUnicos = new Set();
      const alumnos = [];
      const docentes = [];
      const curso = {
        id: null,
        nombre: null,
        area_id: null,
        area_nombre: null,
        especialidad_id: null,
        especialidad_nombre: null,
        fecha_inicio: null,
        fecha_fin: null,
      };

      rows.forEach((row) => {
        if (!alumnosUnicos.has(row.alumno_id)) {
          alumnosUnicos.add(row.alumno_id);
          alumnos.push({
            id: row.alumno_id,
            nombre: row.alumno_nombre,
            apellidos: row.alumno_apellidos,
            email: row.alumno_email,
            telefono: row.alumno_telefono,
          });
        }

        // Verificar si el docente ya se ha agregado al arreglo
        const docente = docentes.find((d) => d.id === row.docente_id);
        if (docente) {
          // Si el docente ya existe, agregar la especialidad a su array de especialidades
          docente.especialidades.push(row.especialidad);
        } else {
          // Si el docente no existe, crear un nuevo objeto y agregarlo al arreglo
          docentes.push({
            id: row.docente_id,
            nombre: row.docente_nombre,
            apellidos: row.docente_apellidos,
            email: row.docente_email,
            telefono: row.docente_telefono,
            especialidades: [row.especialidad],
          });
        }

        // Actualizar la información del curso
        curso.id = row.curso_id;
        curso.nombre = row.curso_nombre;
        curso.area_id = row.area_id;
        curso.area_nombre = row.area_nombre;
        curso.especialidad_id = row.especialidad_id;
        curso.especialidad_nombre = row.especialidad_nombre;
        curso.fecha_inicio = row.fecha_inicio;
        curso.fecha_fin = row.fecha_fin;
      });

      return {
        alumnos,
        docentes,
        curso,
      };
    } catch (error) {
      console.error(
        "Error al obtener la información del plantel y curso:",
        error
      );
      throw error;
    }
  },

  async obtenerCursosPorPlantel(idPlantel) {
    const query = `
      SELECT 
          pc.id AS id,
          p.id AS plantel_id,
          p.nombre AS plantel_nombre,
          c.id AS curso_id,
          c.nombre AS curso_nombre,
          pc.estatus AS curso_validado,
          c.area_id,
  ars.nombre AS area_nombre,
  c.especialidad_id,
  e.nombre AS especialidad_nombre,
          CASE 
              WHEN cd.docente_id IS NOT NULL THEN d.nombre || ' ' || d.apellidos
              ELSE 'Asignación pendiente'
          END AS docente_asignado
      FROM 
          planteles_cursos pc
      JOIN 
          planteles p ON pc.plantel_id = p.id
      JOIN 
          cursos c ON pc.curso_id = c.id
      LEFT JOIN
          cursos_docentes cd ON pc.curso_id = cd.curso_id
      LEFT JOIN
          docentes d ON cd.docente_id = d.id
           JOIN especialidades e ON c.especialidad_id = e.id
  JOIN areas ars ON ars.id = c.area_id
      WHERE 
          p.id = $1;
    `;

    const values = [idPlantel];
    const { rows } = await pool.query(query, values);
    return rows;
  },
  async obtenerDetalleCursosPorPlantel(idPlantelCurso) {
    const query = `
   SELECT
  pc.id AS plantel_curso_id,
  p.id AS plantel_id,
  p.nombre AS plantel_nombre,
  c.id AS curso_id,
  c.nombre AS curso_nombre,
  pc.fecha_inicio,
  pc.fecha_fin,
  c.area_id,
  ars.nombre AS area_nombre,
  c.especialidad_id,
  e.nombre AS especialidad_nombre,
  -- Agrupar los alumnos en un solo array
  ARRAY_AGG(
    DISTINCT JSONB_BUILD_OBJECT(
      'alumno_id', a.id,
      'alumno_nombre', a.nombre,
      'alumno_apellidos', a.apellidos,
      'alumno_email', a.email,
      'alumno_telefono', a.telefono
    )
  ) AS alumnos,
  -- Información del docente actual
  (
    SELECT JSONB_BUILD_OBJECT(
      'docente_id', d.id,
      'docente_nombre', d.nombre,
      'docente_apellidos', d.apellidos,
      'docente_email', d.email,
      'docente_telefono', d.telefono
    )
    FROM docentes d
    JOIN docentes_especialidades de ON d.id = de.docente_id
    WHERE de.especialidad_id = c.especialidad_id
    LIMIT 1 -- Selecciona un único docente
  ) AS docente_actual
FROM
  planteles_cursos pc
  JOIN planteles p ON pc.plantel_id = p.id
  JOIN cursos c ON pc.curso_id = c.id
  LEFT JOIN alumnos_cursos ac ON pc.curso_id = ac.curso_id AND pc.plantel_id = ac.plantel_id
  LEFT JOIN alumnos a ON ac.alumno_id = a.id
  JOIN especialidades e ON c.especialidad_id = e.id
  JOIN areas ars ON ars.id = c.area_id
WHERE
  pc.id = $1  -- Filtrar por el plantel_curso_id específico
GROUP BY
  pc.id, p.id, c.id, ars.id, e.id;

    `;

    const values = [idPlantelCurso];
    const { rows } = await pool.query(query, values);
    return rows;
  },
// en esta parte obtiene todos los olanteles con sus cursso esto debe de ir en la parte de admin principlal
  async getAll2() {
    const query = `

      SELECT 
          pc.id AS id,
          p.id AS plantel_id,
          p.nombre AS plantel_nombre,
          c.id AS curso_id,
          c.nombre AS curso_nombre,
          pc.estatus AS curso_validado,
          CASE 
              WHEN cd.docente_id IS NOT NULL THEN d.nombre || ' ' || d.apellidos
              ELSE 'Asignación pendiente'
          END AS docente_asignado
      FROM 
          planteles_cursos pc
      JOIN 
          planteles p ON pc.plantel_id = p.id
      JOIN 
          cursos c ON pc.curso_id = c.id
      LEFT JOIN
          cursos_docentes cd ON pc.curso_id = cd.curso_id
      LEFT JOIN
          docentes d ON cd.docente_id = d.id
      WHERE 
          p.id = $1;
    `;

    // const values = [idPlantel];
    const { rows } = await pool.query(query);
    return rows;
  },

  async getCursosConEstado(idPlantel) {
    const query = `
SELECT 
    pc.id,
    pc.curso_id,
    pc.plantel_id,
    pc.fecha_inicio,
    pc.fecha_fin,
    c.nombre AS curso_nombre,
    ars.nombre AS area_nombre,
    e.nombre AS especialidad_nombre,
    CASE
        WHEN CURRENT_DATE < pc.fecha_inicio THEN 'Pendiente'
        WHEN CURRENT_DATE BETWEEN pc.fecha_inicio AND pc.fecha_fin THEN 'En Proceso'
        ELSE 'Completado'
    END AS estado,
    CASE
        WHEN CURRENT_DATE < pc.fecha_inicio THEN 0
        WHEN CURRENT_DATE > pc.fecha_fin THEN 100
        ELSE ROUND(
            100.0 * (EXTRACT(EPOCH FROM CURRENT_DATE) - EXTRACT(EPOCH FROM pc.fecha_inicio)) / 
            (EXTRACT(EPOCH FROM pc.fecha_fin) - EXTRACT(EPOCH FROM pc.fecha_inicio)),
            2
        )
    END AS porcentaje_progreso
FROM planteles_cursos pc
JOIN cursos c ON pc.curso_id = c.id
JOIN areas ars ON c.area_id = ars.id
JOIN especialidades e ON c.especialidad_id = e.id
WHERE pc.plantel_id = ${idPlantel}
  AND pc.estatus = true; -- Filtra solo los cursos validados (con estatus 'true')

    `;
    const { rows } = await pool.query(query);
    return rows;

  },
  async getInfoByPlantel(idPlantel) {
    const query = `
     SELECT
  (SELECT COUNT(*) 
   FROM cursos_docentes cd
   JOIN planteles_cursos pc ON cd.curso_id = pc.curso_id
   WHERE pc.plantel_id = p.id AND pc.estatus = true) AS num_docentes,
   
  (SELECT COUNT(*) 
   FROM alumnos_cursos ac
   JOIN planteles_cursos pc ON ac.curso_id = pc.curso_id
   WHERE pc.plantel_id = p.id AND pc.estatus = true) AS num_alumnos,
   
  (SELECT COUNT(*) 
   FROM planteles_cursos pc2
   WHERE pc2.plantel_id = p.id AND pc2.estatus = true) AS num_cursos
   
FROM planteles p
WHERE p.id = ${idPlantel};

    `;
        // const values = [idPlantel];
        const { rows } = await pool.query(query);
        return rows;
    // const { rows } = await this.pool.query(query, [idPlantel]);

    // return rows[0];
  }
  
};

module.exports = PlantelesCursos;
