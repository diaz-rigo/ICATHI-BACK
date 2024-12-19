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
      fecha_fin,
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
      fecha_fin,
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

  //   async obtenerCursosPorPlantel(plantelId) {
  //     try {
  //       const query = `
  //   SELECT
  //     pc.*,
  //     pc.estatus AS isValidado,
  //     c.nombre,
  //     c.duracion_horas,
  //     c.*,
  //     p.id AS plantel_id,
  //     p.nombre AS plantel_nombre,
  //     p.direccion AS plantel_direccion,
  //     (SELECT COUNT(*)
  //      FROM cursos_docentes cd
  //      WHERE cd.curso_id = c.id) AS docente_asignado
  // FROM planteles_cursos pc
  // INNER JOIN cursos c ON pc.curso_id = c.id
  // INNER JOIN planteles p ON pc.plantel_id = p.id
  // WHERE p.id = $1;

  // `;

  //       const values = [plantelId];
  //       const { rows } = await pool.query(query, values);

  //       return rows; // Retorna todos los cursos encontrados con la información del docente asignado
  //     } catch (error) {
  //       console.error("Error al obtener cursos por plantel:", error);
  //       throw error; // Lanza el error para manejarlo en el nivel superior
  //     }
  //   },
  // Modelo

  async eliminarCursosPorPlantel(plantelId) {
    try {
      const query = `
      DELETE FROM planteles_cursos
      WHERE id = $1
      RETURNING *;
    `;

      console.log("plantelId=>", plantelId);

      const values = [plantelId];
      const { rowCount, rows } = await pool.query(query, values);

      // Retornar la cantidad de filas eliminadas y los registros eliminados
      return { rowCount, rows };
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
          a.id AS alumno_id,
          a.nombre AS alumno_nombre,
          a.apellidos AS alumno_apellidos,
          a.email AS alumno_email,
          a.telefono AS alumno_telefono,
          d.id AS docente_id,
          d.nombre AS docente_nombre,
          d.apellidos AS docente_apellidos,
          d.email AS docente_email,
          d.telefono AS docente_telefono,
          e.nombre AS especialidad,
          c.area_id,
          ars.nombre AS area_nombre,   -- Selecciona todas las columnas de la tabla 'alumnos'
pc.fecha_inicio AS fecha_inicio,  -- Selecciona todas las columnas de la tabla 'alumnos'
    pc.fecha_fin AS fecha_fin  , -- Selecciona todas las columnas de la tabla 'alumnos'
          c.especialidad_id,
          e.nombre AS especialidad_nombre
        FROM
          planteles_cursos pc
          JOIN planteles p ON pc.plantel_id = p.id
          JOIN cursos c ON pc.curso_id = c.id
          JOIN alumnos_cursos ac ON pc.curso_id = ac.curso_id AND pc.plantel_id = ac.plantel_id
          JOIN alumnos a ON ac.alumno_id = a.id
          JOIN docentes_especialidades de ON c.especialidad_id = de.especialidad_id
          JOIN docentes d ON de.docente_id = d.id
          JOIN especialidades e ON de.especialidad_id = e.id
           JOIN 
    areas ars ON ars.id = c.area_id
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
          pc.estatus AS curso_validado
      FROM 
          planteles_cursos pc
      JOIN 
          planteles p ON pc.plantel_id = p.id
      JOIN 
          cursos c ON pc.curso_id = c.id
      WHERE 
          p.id = \$1;  -- Filtrar por el ID del plantel
    `;

    const values = [idPlantel];
    const { rows } = await pool.query(query, values);
    return rows;
  },
};

module.exports = PlantelesCursos;
