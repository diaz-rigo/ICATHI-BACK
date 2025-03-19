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
    console.log("-------",data)
    const {
      plantelId,
      curso_id,
      horario,
      cupo_maximo,
      requisitos_extra,
      fecha_inicio,
      fecha_fin,
      num_instructores,
      instructor,
      domingo_inicio,
      domingo_fin,
      lunes_inicio,
      lunes_fin,
      martes_inicio,
      martes_fin,
      miercoles_inicio,
      miercoles_fin,
      jueves_inicio,
      jueves_fin,
      viernes_inicio,
      viernes_fin,
      sabado_inicio,
      sabado_fin,
      calle,
      localidad,
      municipio,
      num_interior,
      num_exterior,
      convenio_numero,
      cruzada_contra_hambre,
      cuota_monto,
      cuota_tipo,
      pagar_final,
      participantes,
      rango_edad,
      sector_atendido,
      tipo_beca,
      tipo_curso,
    } = data;
  
    // Verificar si el plantelId es un ID de usuario
    const usuarioQuery = `
      SELECT * FROM usuarios WHERE id = $1;
    `;
    const usuarioValues = [plantelId];
    const { rows: usuarioRows } = await pool.query(usuarioQuery, usuarioValues);
  
    if (!usuarioRows.length) {
      throw new Error(`El usuario con ID ${plantelId} no existe.`);
    }
  
    // Obtener el ID del plantel asociado al usuario
    const plantelQuery = `
      SELECT id FROM planteles WHERE id_usuario = $1;
    `;
    const plantelValues = [plantelId];
    const { rows: plantelRows } = await pool.query(plantelQuery, plantelValues);
  
    if (!plantelRows.length) {
      throw new Error(`No se encontró un plantel asociado al usuario con ID ${plantelId}.`);
    }
  
    const plantelIdReal = plantelRows[0].id;
  
    // Insertar horario en la tabla horario_semanal
    const horarioQuery = `
      INSERT INTO horario_semanal (
        lunes_inicio,
        lunes_fin,
        martes_inicio,
        martes_fin,
        miercoles_inicio,
        miercoles_fin,
        jueves_inicio,
        jueves_fin,
        viernes_inicio,
        viernes_fin,
        sabado_inicio,
        sabado_fin,
        domingo_inicio,
        domingo_fin
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id_horario;
    `;
    const horarioValues = [
      lunes_inicio,
      lunes_fin,
      martes_inicio,
      martes_fin,
      miercoles_inicio,
      miercoles_fin,
      jueves_inicio,
      jueves_fin,
      viernes_inicio,
      viernes_fin,
      sabado_inicio,
      sabado_fin,
      domingo_inicio,
      domingo_fin,
    ];
    const { rows: horarioRows } = await pool.query(horarioQuery, horarioValues);
    const horarioId = horarioRows[0].id_horario;
    console.log("-----")
    console.log(horarioId)
    console.log("-----")
    // Insertar en la tabla planteles_cursos
    const query = `
      INSERT INTO planteles_cursos (
        plantel_id,
        curso_id,
        horario_id,
        horario,
        cupo_maximo,
        requisitos_extra,
        fecha_inicio,
        fecha_fin,
        sector_atendido,
        rango_edad,
        tipo_beca,
        tipo_curso,
        convenio_numero,
        cruzada_contra_hambre,
        cuota_tipo,
        cuota_monto,
        pagar_final,
        participantes,
        calle,
        localidad,
        municipio,
        num_interior,
        num_exterior,
        cant_instructores
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22,$23,$24)
      RETURNING *;
    `;
    const values = [
      plantelIdReal,
      curso_id,
      horarioId,
      horario,
      cupo_maximo,
      requisitos_extra,
      fecha_inicio,
      fecha_fin,
      sector_atendido,
      rango_edad,
      tipo_beca,
      tipo_curso,
      convenio_numero,
      cruzada_contra_hambre,
      cuota_tipo,
      cuota_monto,
      pagar_final,
      participantes,
      calle,
      localidad,
      municipio,
      num_interior,
      num_exterior,
      num_instructores,
    ];
    const { rows } = await pool.query(query, values);
    const plantelesCursosId = rows[0].id;
  
    // Insertar instructor en la tabla cursos_docentes
// Insertar cada instructor en cursos_docentes
for (const docenteId of instructor) {
  const instructorQuery = `
    INSERT INTO cursos_docentes (
      curso_id,
      docente_id,
      estatus,id_plantel
    ) VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const instructorValues = [curso_id, docenteId, true,plantelIdReal];
  await pool.query(instructorQuery, instructorValues);
}

  
    return rows[0];
  }
  
  ,
  
  async  getAlumnosByUsuarioId(usuarioId) {
    try {
      // Paso 1: Obtener el plantel asociado al usuario
      const plantelQuery = `
        SELECT id FROM planteles WHERE id_usuario = $1;`;
      const { rows: plantelRows } = await pool.query(plantelQuery, [usuarioId]);
  
      if (plantelRows.length === 0) {
        throw new Error('No se encontró un plantel asociado a este usuario.');
      }
  
      const plantelId = plantelRows[0].id;
  
      // Paso 2: Obtener los cursos del plantel
      const cursosQuery = `
        SELECT curso_id FROM planteles_cursos WHERE plantel_id = $1;`;
      const { rows: cursosRows } = await pool.query(cursosQuery, [plantelId]);
  
      if (cursosRows.length === 0) {
        return []; // Retornar un array vacío si no hay cursos
      }
  
      const cursoIds = cursosRows.map(row => row.curso_id);
  
      // Paso 3: Obtener los alumnos registrados en esos cursos junto con el nombre del curso
      const alumnosQuery = `
        SELECT a.id AS alumno_id, a.nombre, a.apellidos, a.email, c.nombre AS curso_nombre
        FROM alumnos a
        JOIN alumnos_cursos ac ON a.id = ac.alumno_id
        JOIN cursos c ON ac.curso_id = c.id
        WHERE ac.curso_id = ANY($1::int[])
          AND ac.plantel_id = $2;`;
      const { rows: alumnosRows } = await pool.query(alumnosQuery, [cursoIds, plantelId]);
  
      return alumnosRows;
    } catch (error) {
      console.error('Error al obtener los alumnos:', error);
      throw error; // Propagar el error
    }
  }
  
  
,  
  
  
  async obtenerSolicitudes() {
    const query = "SELECT * FROM planteles_cursos;";
    const { rows } = await pool.query(query);
    return rows;
  },

  async actualizarEstatus(id, estatus, observacion = null, sugerencia = null) {
    const query = `
        UPDATE planteles_cursos
        SET estatus = $1, 
            requisitos_extra = COALESCE($2, requisitos_extra), 
            sugerencia = COALESCE($3, sugerencia), 
            updated_at = now()
        WHERE id = $4
        RETURNING *;
    `;

    const values = [estatus, observacion, sugerencia, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
},



  async obtenerCursosPorPlantelDetalle(plantelId) {
    // const query = `
    // SELECT 
    //   pc.id AS plantel_curso_id,
    //   p.id AS plantel_id,
    //   p.nombre AS plantel_nombre,
    //   pc.calle AS plantel_calle,
    //   pc.localidad AS plantel_localidad,
    //   pc.municipio AS plantel_municipio,
    //   pc.num_interior AS plantel_num_interior,
    //   pc.num_exterior AS plantel_num_exterior,
    //   c.id AS curso_id,
    //   c.nombre AS curso_nombre,
    //   pc.estatus AS curso_validado,
    //   pc.estatus_id,
    //   pc.created_at,
    //   c.area_id,
    //   ars.nombre AS area_nombre,
    //   c.especialidad_id,
    //   e.nombre AS especialidad_nombre,
    //   pc.cupo_maximo,
    //   pc.requisitos_extra,
    //   pc.fecha_inicio,
    //   pc.fecha_fin,
    //   pc.sector_atendido,
    //   pc.rango_edad,
    //   pc.tipo_beca,
    //   pc.tipo_curso,
    //   pc.convenio_numero,
    //   pc.cruzada_contra_hambre,
    //   pc.cuota_tipo,
    //   pc.cuota_monto,
    //   pc.pagar_final,
    //   pc.participantes,
    //   pc.cant_instructores,
    //   COALESCE(d.id, 0) AS docente_id,
    //   COALESCE(d.nombre, 'No hay docente asignado') AS docente_nombre,
    //   COALESCE(d.apellidos, '') AS docente_apellidos,
    //   COALESCE(d.email, '') AS docente_email,
    //   COALESCE(d.telefono, '') AS docente_telefono,
    //   u.nombre AS usuario_nombre,
    //   u.apellidos AS usuario_apellidos
    // FROM 
    //   planteles_cursos pc
    // JOIN 
    //   planteles p ON pc.plantel_id = p.id
    // JOIN 
    //   cursos c ON pc.curso_id = c.id
    // JOIN 
    //   especialidades e ON c.especialidad_id = e.id
    // JOIN 
    //   areas ars ON ars.id = c.area_id
    // LEFT JOIN
    //   cursos_docentes cd ON pc.curso_id = cd.curso_id
    // LEFT JOIN
    //   docentes d ON cd.docente_id = d.id
    // JOIN 
    //   usuarios u ON u.id = p.id_usuario
    // WHERE 
    //   u.id = $1;
    // `;
    const query = `
       

SELECT 
    pc.id AS plantel_curso_id,
    p.id AS plantel_id,
    p.nombre AS plantel_nombre,
    pc.calle AS plantel_calle,
    pc.localidad AS plantel_localidad,
    pc.municipio AS plantel_municipio,
    pc.num_interior AS plantel_num_interior,
    pc.num_exterior AS plantel_num_exterior,
    c.id AS curso_id,
    c.nombre AS curso_nombre,
    pc.estatus AS curso_validado,
    pc.estatus_id,
    pc.created_at,
    c.area_id,
    ars.nombre AS area_nombre,
    c.especialidad_id,
    e.nombre AS especialidad_nombre,
    pc.cupo_maximo,
    pc.requisitos_extra,
    pc.fecha_inicio,
    pc.fecha_fin,
    pc.sector_atendido,
    pc.rango_edad,
    pc.tipo_beca,
    pc.tipo_curso,
    pc.convenio_numero,
    pc.cruzada_contra_hambre,
    pc.cuota_tipo,
    pc.cuota_monto,
    pc.pagar_final,
    pc.participantes,
    pc.cant_instructores,
    COALESCE(STRING_AGG(d.nombre, ', '), 'No hay docente asignado') AS docente_nombre,
    COALESCE(STRING_AGG(d.apellidos, ', '), '') AS docente_apellidos,
    COALESCE(STRING_AGG(d.email, ', '), '') AS docente_email,
    COALESCE(STRING_AGG(d.telefono, ', '), '') AS docente_telefono,
    u.nombre AS usuario_nombre,
    u.apellidos AS usuario_apellidos
FROM 
    planteles_cursos pc
JOIN 
    planteles p ON pc.plantel_id = p.id
JOIN 
    cursos c ON pc.curso_id = c.id
JOIN 
    especialidades e ON c.especialidad_id = e.id
JOIN 
    areas ars ON ars.id = c.area_id
LEFT JOIN
    cursos_docentes cd ON pc.curso_id = cd.curso_id
LEFT JOIN
    docentes d ON cd.docente_id = d.id
JOIN 
    usuarios u ON u.id = p.id_usuario
WHERE 
    u.id = $1
GROUP BY 
    pc.id, p.id, p.nombre, pc.calle, pc.localidad, pc.municipio, pc.num_interior, pc.num_exterior,
    c.id, c.nombre, pc.estatus, pc.estatus_id, pc.created_at, c.area_id, ars.nombre, c.especialidad_id,
    e.nombre, pc.cupo_maximo, pc.requisitos_extra, pc.fecha_inicio, pc.fecha_fin, pc.sector_atendido,
    pc.rango_edad, pc.tipo_beca, pc.tipo_curso, pc.convenio_numero, pc.cruzada_contra_hambre,
    pc.cuota_tipo, pc.cuota_monto, pc.pagar_final, pc.participantes, pc.cant_instructores,
    u.nombre, u.apellidos;

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

  async obtenerInfoPlantelCursoCompleta(idPlantelCurso) {
    try {
      // Consulta del curso, plantel y horario
      const queryCurso = `SELECT 
    pc.id AS plantel_curso_id,
    p.id AS plantel_id,
    p.nombre AS plantel_nombre,
    pc.calle AS plantel_calle,
    pc.localidad AS plantel_localidad,
    pc.municipio AS plantel_municipio,
    pc.num_interior AS plantel_num_interior,
    pc.num_exterior AS plantel_num_exterior,
    c.id AS curso_id,
    c.nombre AS curso_nombre,
    pc.estatus AS curso_validado,
    pc.estatus_id,
    pc.created_at,
    c.area_id,
    ars.nombre AS area_nombre,
    c.especialidad_id,
    e.nombre AS especialidad_nombre,
    pc.horario_id,
    h.lunes_inicio,
    h.lunes_fin,
    h.martes_inicio,
    h.martes_fin,
    h.miercoles_inicio,
    h.miercoles_fin,
    h.jueves_inicio,
    h.jueves_fin,
    h.viernes_inicio,
    h.viernes_fin,
    h.sabado_inicio,
    h.sabado_fin,
    h.domingo_inicio,
    h.domingo_fin,
    pc.cupo_maximo,
    pc.requisitos_extra,
    pc.fecha_inicio,
    pc.fecha_fin,
    pc.sector_atendido,
    pc.rango_edad,
    pc.tipo_beca,
    pc.tipo_curso,
    pc.convenio_numero,
    pc.cruzada_contra_hambre,
    pc.cuota_tipo,
    pc.cuota_monto,
    pc.pagar_final,
    pc.participantes,
    pc.cant_instructores
FROM 
    planteles_cursos pc
JOIN 
    planteles p ON pc.plantel_id = p.id
JOIN 
    cursos c ON pc.curso_id = c.id
JOIN 
    especialidades e ON c.especialidad_id = e.id
JOIN 
    areas ars ON ars.id = c.area_id
JOIN 
    horario_semanal h ON pc.horario_id = h.id_horario
WHERE 
    pc.id = $1;
`;
      const valuesCurso = [idPlantelCurso];
      const { rows: cursoData } = await pool.query(queryCurso, valuesCurso);
  
      // Obtener el curso y plantel
      const curso = {
        // Extrae los valores de cursoData, que tendrá solo la información básica
        ...cursoData[0],  // Asumiendo que solo hay un curso con ese id
        plantel: { /* ... */ },
        horario: { /* ... */ },
      };
  // console.log("[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[.",curso)
      // Obtener alumnos
      const queryAlumnos = `SELECT
    a.id AS alumno_id,
    a.nombre AS alumno_nombre,
    a.apellidos AS alumno_apellidos,
    a.email AS alumno_email,
    a.telefono AS alumno_telefono
FROM 
    alumnos_cursos ac
JOIN 
    alumnos a ON ac.alumno_id = a.id
WHERE 
    ac.curso_id = $1 AND ac.plantel_id = $2;
`;
      const valuesAlumnos = [cursoData[0].curso_id, cursoData[0].plantel_id];
      // console.log("*************************************",cursoData[0].curso_id, cursoData[0].plantel_id);  // Asegúrate que estos valores sean correctos

      const { rows: alumnosData } = await pool.query(queryAlumnos, valuesAlumnos);
      
      // Organizar los alumnos
      const alumnos = alumnosData.map(row => ({
        id: row.alumno_id,
        nombre: row.alumno_nombre,
        apellidos: row.alumno_apellidos,
        email: row.alumno_email,
        telefono: row.alumno_telefono,
      }));
  
      // Obtener docentes
      const queryDocentes = `SELECT
    d.id AS docente_id,
    d.nombre AS docente_nombre,
    d.apellidos AS docente_apellidos,
    d.email AS docente_email,
    d.telefono AS docente_telefono
FROM 
    cursos_docentes cd
JOIN 
    docentes d ON cd.docente_id = d.id
WHERE 
    cd.curso_id = $1
        AND cd.estatus = TRUE;

`;
      const valuesDocentes = [cursoData[0].curso_id];
      const { rows: docentesData } = await pool.query(queryDocentes, valuesDocentes);
  
      // Organizar los docentes
      const docentes = docentesData.map(row => ({
        id: row.docente_id,
        nombre: row.docente_nombre,
        apellidos: row.docente_apellidos,
        email: row.docente_email,
        telefono: row.docente_telefono,
      }));
  
      // Devolver todo junto
      return {
        curso,
        alumnos,
        docentes,
      };
  
    } catch (error) {
      console.error("Error al obtener la información del plantel y curso:", error);
      throw error;
    }
  }
  
,
  async obtenerCursosPorPlantel(idPlantel) {
    const query = `
    SELECT 
    pc.id AS id,
    p.id AS plantel_id,
    p.nombre AS plantel_nombre,
    c.id AS curso_id,
    c.nombre AS curso_nombre,
    pc.estatus AS curso_validado,
    pc.created_at,
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
JOIN 
    especialidades e ON c.especialidad_id = e.id
JOIN 
    areas ars ON ars.id = c.area_id
JOIN 
    usuarios u ON u.id = p.id_usuario
WHERE 
    u.id = $1; -- Este $1 debe ser reemplazado por el ID del usuario.

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
,

  async updateCourse_solicitud_ById(id, data) {
    try {
      const updateFields = [];
      const updateValues = [];
      let index = 1;
  
      const fields = {
        plantel_id: data.plantel_id,
        curso_id: data.curso_id,
        cupo_maximo: data.cupo_maximo,
        requisitos_extra: data.requisitos_extra,
        fecha_inicio: data.fecha_inicio,
        fecha_fin: data.fecha_fin,
        estatus_id: data.estatus_id,
        temario_url: data.temario_url,
        cant_instructores: data.cant_instructores,
        horario_id: data.horario_id,
        sector_atendido: data.sector_atendido,
        rango_edad: data.rango_edad,
        cruzada_contra_hambre: data.cruzada_contra_hambre,
        tipo_beca: data.tipo_beca,
        participantes: data.participantes,
        cuota_tipo: data.cuota_tipo,
        cuota_monto: data.cuota_monto,
        pagar_final: data.pagar_final,
        convenio_numero: data.convenio_numero,
        equipo_necesario: data.equipo_necesario,
        horario: data.horario,
        estatus: data.estatus,
        tipos_curso: data.tipos_curso,
        sugerencia: data.sugerencia,
        municipio: data.municipio,
        localidad: data.localidad,
        calle: data.calle,
        num_interior: data.num_interior,
        num_exterior: data.num_exterior,
        tipo_curso: data.tipo_curso,
      };
  
      // Construir campos dinámicamente
      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined) {
          updateFields.push(`${key} = $${index++}`);
          updateValues.push(value);
        }
      }
  
      updateValues.push(id); // El ID siempre al final
  
      const query = `
        UPDATE planteles_cursos
        SET ${updateFields.join(', ')}, updated_at = NOW()
        WHERE id = $${index}
        RETURNING *;
      `;
  
      console.log('Consulta preparada:', query);
      console.log('Valores:', updateValues);
  
      const resultado = await pool.query(query, updateValues);
      return resultado.rows[0];
    } catch (error) {
      console.error('Error actualizando curso:', error);
      throw error;
    }
  }
  
  
  ,
  async obtenerCursosPorPlantel(plantelId) {
    const query = `
        SELECT 
            pc.id AS plantel_curso_id,
            pc.curso_id, 
            c.nombre AS curso_nombre, 
            pc.estatus 
        FROM planteles_cursos pc
        JOIN cursos c ON pc.curso_id = c.id
        WHERE pc.plantel_id = $1
        ORDER BY c.nombre;
    `;
    const { rows } = await pool.query(query, [plantelId]);
    return rows;
},
async obtenerSolicitudescompletas() {
  const query = `
      SELECT 
          p.id AS plantel_id, 
          p.nombre AS plantel_nombre,  
          p.estatus,
          pc.id AS plantel_curso_id
      FROM planteles p
      JOIN planteles_cursos pc ON p.id = pc.plantel_id
      ORDER BY p.nombre;
  `;
  const { rows } = await pool.query(query);
  return rows;
},
async obtenerDetalleCursocompletoPorId(idCurso) {
  try {
    const query = `
      SELECT 
          pc.id AS plantel_curso_id,
          p.nombre AS plantel_nombre,
          c.nombre AS curso_nombre,
          tc.nombre AS tipo_curso_nombre,
          pc.cupo_maximo,
          pc.requisitos_extra,
          pc.fecha_inicio,
          pc.fecha_fin,
          pc.estatus,
          pc.temario_url,
          pc.cant_instructores,
          pc.horario_id,
          pc.sector_atendido,
          pc.rango_edad,
          pc.cruzada_contra_hambre,
          pc.tipo_beca,
          pc.participantes,
          pc.cuota_tipo,
          pc.cuota_monto,
          pc.pagar_final,
          pc.convenio_numero,
          pc.equipo_necesario,
          pc.tipo_curso,
          pc.horario,
          pc.tipos_curso
      FROM 
          planteles_cursos pc
      JOIN 
          planteles p ON pc.plantel_id = p.id
      JOIN 
          cursos c ON pc.curso_id = c.id
      JOIN 
          tipos_curso tc ON pc.tipo_curso = tc.id
      WHERE 
          pc.id = $1;
    `;

    const { rows } = await pool.query(query, [idCurso]);
    return rows[0];
  } catch (error) {
    console.error("Error al obtener el detalle del curso por ID:", error);
    throw error;
  }
},
};

module.exports = PlantelesCursos;
