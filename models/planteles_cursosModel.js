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
      SET estatus = $1, requisitos_extra = COALESCE($2, requisitos_extra), updated_at = now()
      WHERE id = $3
      RETURNING *;
    `;

    const values = [estatus, observacion, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async obtenerCursosPorPlantel(plantelId) {
    try {
      const query = `
  SELECT 
    pc.*,
    pc.estatus AS isValidado,
    c.nombre,
    c.duracion_horas,
    c.*,
    p.id AS plantel_id,
    p.nombre AS plantel_nombre,
    p.direccion AS plantel_direccion,
    (SELECT COUNT(*) 
     FROM cursos_docentes cd 
     WHERE cd.curso_id = c.id) AS docente_asignado
FROM planteles_cursos pc
INNER JOIN cursos c ON pc.curso_id = c.id
INNER JOIN planteles p ON pc.plantel_id = p.id
WHERE p.id = $1;

`;

      const values = [plantelId];
      const { rows } = await pool.query(query, values);

      return rows; // Retorna todos los cursos encontrados con la información del docente asignado
    } catch (error) {
      console.error("Error al obtener cursos por plantel:", error);
      throw error; // Lanza el error para manejarlo en el nivel superior
    }
  },
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
  // async registrarSolicitud(req, res) {
  //   try {
  //     const nuevaSolicitud = await PlantelesCursosModel.registrarSolicitud(
  //       req.body
  //     );
  //     console.log(req.body);

  //     res.status(201).json({
  //       message: "Solicitud registrada exitosamente",
  //       data: nuevaSolicitud,
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     res.status(500).json({
  //       message: "Error al registrar la solicitud",
  //       error: error.message,
  //     });
  //   }
  // },
};

module.exports = PlantelesCursos;
