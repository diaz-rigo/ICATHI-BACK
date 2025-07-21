const pool = require("../config/database");
const { getByIdInfoReporte } = require("../controllers/cursosController");

const CursosModel = {
  // async getAll() {
  //   const query = `
  //     SELECT 
  //       c.id, 
  //       c.nombre, 
  //       c.clave,
  //       c.duracion_horas,
  //       c.descripcion, -- Incluimos el campo descripcion
  //       c.area_id,
  //       a.nombre AS area_nombre,
  //       c.especialidad_id,
  //       e.nombre AS especialidad_nombre,
  //       c.tipo_curso_id,
  //       c.estatus,
  //       t.nombre AS tipo_curso_nombre,
  //       c.vigencia_inicio,
  //       c.fecha_publicacion,
  //       c.ultima_actualizacion
  //     FROM cursos c
  //     JOIN areas a ON c.area_id = a.id
  //     JOIN especialidades e ON c.especialidad_id = e.id
  //     JOIN tipos_curso t ON c.tipo_curso_id = t.id
  //   `;
  //   const { rows } = await pool.query(query);
  //   return rows;
  // },
  async getAll() {
    const query = `
SELECT 
    c.id, 
    c.nombre, 
    c.clave,
    c.duracion_horas,
    c.descripcion,
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
LEFT JOIN areas a ON c.area_id = a.id
LEFT JOIN especialidades e ON c.especialidad_id = e.id
JOIN tipos_curso t ON c.tipo_curso_id = t.id 
    `;
    const { rows } = await pool.query(query);
    return rows;
  },
  async getAllByIdPlantel(idPlantel) {
    const query = `
    SELECT 
  c.id, 
  c.nombre, 
  c.clave,
  c.duracion_horas,
  c.descripcion,
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
FROM planteles_cursos pc
JOIN cursos c ON pc.curso_id = c.id
JOIN areas a ON c.area_id = a.id
JOIN especialidades e ON c.especialidad_id = e.id
JOIN tipos_curso t ON c.tipo_curso_id = t.id
WHERE pc.plantel_id = ${idPlantel} AND pc.estatus = true


    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  async getById(id) {
    const query = `  
      SELECT   
        c.id,   
        c.nombre,   
        c.clave,  
        c.duracion_horas,  
        c.descripcion,  
        c.area_id,  
        a.nombre AS area_nombre,  
        c.especialidad_id,  
        e.nombre AS especialidad_nombre,  
        c.tipo_curso_id,  
        t.nombre AS tipo_curso_nombre,  
        c.vigencia_inicio,  
        c.fecha_publicacion,  
        c.vigencia_inicio,  
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

  async getByIdInfoReporte(id) {

    const query = `
      SELECT 
  c.id,
  c.nombre AS NOMBRE,
  c.clave AS CLAVE,
  c.duracion_horas AS DURACION_HORAS,
  c.descripcion AS DESCRIPCION,
  c.area_id AS AREA_ID,
  c.especialidad_id AS ESPECIALIDAD_ID,
  c.vigencia_inicio AS VIGENCIA_INICIO,
  c.fecha_publicacion AS FECHA_PUBLICACION,
  c.usuario_validador_id AS USUARIO_VALIDADOR_ID,
  c.fecha_validacion AS FECHA_VALIDACION,
  c.elaborado_por AS ELABORADO_POR,
  c.revisado_por AS REVISADO_POR,
  c.autorizado_por AS AUTORIZADO_POR,
  c.tipo_curso_id AS tipo_curso_id,
  c.version_formato,
  c.fecha_emision_formato,
  c.codigo_formato,
  c.reviso_aprobo_texto,

  t.nombre AS tipo_curso,
  ft.objetivo,
  ft.perfil_ingreso,
  ft.perfil_egreso,
  ft.perfil_del_docente,
  ft.metodologia,
  ft.bibliografia,
  ft.criterios_acreditacion,
  ft.reconocimiento,c.nota_materiales,
  -- Datos de las firmas
  JSONB_BUILD_OBJECT(
    'elaborado_por', JSONB_BUILD_OBJECT(
      'nombre', fe.nombre,
      'cargo', fe.cargo
    ),
    'revisado_por', JSONB_BUILD_OBJECT(
      'nombre', fr.nombre,
      'cargo', fr.cargo
    ),
    'autorizado_por', JSONB_BUILD_OBJECT(
      'nombre', fa.nombre,
      'cargo', fa.cargo
    )
  ) AS firmas,
  -- Agrupando materiales en un array
  ARRAY_AGG(
    DISTINCT JSONB_BUILD_OBJECT(
      'material_descripcion', m.descripcion,
      'material_unidad_de_medida', m.unidad_de_medida,
      'material_cantidad_10', m.cantidad_10,
      'material_cantidad_15', m.cantidad_15,
      'material_cantidad_20', m.cantidad_20
    )
  ) AS materiales,
  -- Agrupando equipamiento en un array
  ARRAY_AGG(
    DISTINCT JSONB_BUILD_OBJECT(
      'equipamiento_descripcion', e.descripcion,
      'equipamiento_unidad_de_medida', e.unidad_de_medida,
      'equipamiento_cantidad_10', e.cantidad_10,
      'equipamiento_cantidad_15', e.cantidad_15,
      'equipamiento_cantidad_20', e.cantidad_20
    )
  ) AS equipamiento
FROM 
  cursos c
LEFT JOIN 
  ficha_tecnica ft ON c.id = ft.id_curso
LEFT JOIN 
  material m ON c.id = m.id_curso
LEFT JOIN 
  equipamiento e ON c.id = e.id_curso
LEFT JOIN 
  tipos_curso t ON c.tipo_curso_id = t.id
LEFT JOIN 
  firmas fe ON c.elaborado_por = fe.id -- Firma de elaborado_por
LEFT JOIN 
  firmas fr ON c.revisado_por = fr.id -- Firma de revisado_por
LEFT JOIN 
  firmas fa ON c.autorizado_por = fa.id -- Firma de autorizado_por
WHERE 
  c.id = $1
GROUP BY 
  c.id, ft.objetivo, ft.perfil_ingreso, ft.perfil_egreso, ft.perfil_del_docente, 
  ft.metodologia, ft.bibliografia, ft.criterios_acreditacion, ft.reconocimiento,
  fe.nombre, fe.cargo, fr.nombre, fr.cargo, fa.nombre, fa.cargo, t.nombre; `;

    const { rows } = await pool.query(query, [id]);

    // Validar si no hay resultados
    if (!rows || rows.length === 0) {
      return null;
    }

    // Verificar si los materiales y equipamiento están vacíos y asignar "vacío" o "0"
    const curso = rows[0];

    curso.materiales = curso.materiales.length > 0 ? curso.materiales : null;
    curso.equipamiento =
      curso.equipamiento.length > 0 ? curso.equipamiento : null;

    return curso;
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
        descripcion = \$4,        
        area_id = \$5,        
        especialidad_id = \$6,        
        tipo_curso_id = \$7,        
        vigencia_inicio = \$8,        
        fecha_publicacion = \$9,        
        ultima_actualizacion = \$10,        
        estatus = \$11      
      WHERE id = \$12        
      RETURNING *        
    `;

    const values = [
      curso.nombre,
      curso.clave || null,
      curso.duracion_horas,
      curso.descripcion,
      curso.area_id,
      curso.especialidad_id,
      curso.tipo_curso_id,
      curso.vigencia_inicio || null,
      curso.fecha_publicacion || null,
      curso.ultima_actualizacion || null,
      curso.estatus,
      id,
    ];

    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async delete(id) {
    const query = "DELETE FROM cursos WHERE id = $1 RETURNING *";
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

  async delete(id) {
    const query = "DELETE FROM cursos WHERE id = $1 RETURNING *"; // Consulta para eliminar el curso
    const { rows } = await pool.query(query, [id]); // Ejecuta la consulta con el ID
    return rows[0]; // Devuelve el curso eliminado
  },
  async getCursosByAreaIdByEspecialidadId(areaId, especialidadId) {
    //sobcunsulta para tomar el curso por area y especialidad
    const query = `
      SELECT 
        c.id, 
        c.nombre, 
        c.clave,
        c.duracion_horas,
        c.descripcion,
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
      WHERE c.area_id = $1 AND c.especialidad_id = $2
    `;
    const { rows } = await pool.query(query, [areaId, especialidadId]);
    return rows;
  },
  async getCursosByEspecialidadId(especialidadId, usuarioId) {
    try {
      // 1️⃣ Obtener el ID del plantel del usuario
      // const plantelQuery = `
      //   SELECT id FROM planteles WHERE id_usuario = $1 LIMIT 1
      // `;
      // const plantelResult = await pool.query(plantelQuery, [usuarioId]);

      // if (plantelResult.rows.length === 0) {
      //   throw new Error("No se encontró un plantel asociado al usuario.");
      // }

      // const plantelId = plantelResult.rows[0].id;
      const plantelId = usuarioId;

      // 2️⃣ Consultar los cursos con la validación de "registrado"
      const cursosQuery = `
        SELECT 
          c.id, 
          c.nombre, 
          c.descripcion, 
          c.duracion_horas, 
          c.nivel, 
          c.costo, 
          c.requisitos, 
          c.estatus, 
          c.created_at, 
          c.updated_at, 
          c.usuario_validador_id, 
          c.fecha_validacion, 
          c.modalidad, 
          c.clave, 
          c.area_id, 
          c.especialidad_id, 
          c.tipo_curso_id, 
          c.vigencia_inicio, 
          c.fecha_publicacion, 
          c.ultima_actualizacion,
          CASE 
            WHEN pc.curso_id IS NOT NULL THEN true
            ELSE false
          END AS registrado
        FROM 
          cursos c
        LEFT JOIN 
          planteles_cursos pc 
          ON c.id = pc.curso_id AND pc.plantel_id = $2
        WHERE 
          c.especialidad_id = $1
      `;

      const cursosResult = await pool.query(cursosQuery, [
        especialidadId,
        plantelId,
      ]);

      return cursosResult.rows;
    } catch (error) {
      console.error("Error al obtener los cursos:", error);
      throw error;
    }
  },


  // async getDetailedCursos() {
  //   const query = `
  //     SELECT 
  //       c.id, 
  //       c.estatus, 
  //       c.area_id, 
  //       a.nombre AS area_nombre, 
  //       c.especialidad_id, 
  //       e.nombre AS especialidad_nombre, 
  //       c.clave, 
  //       c.nombre AS curso_nombre, 
  //       c.tipo_curso_id, 
  //       t.nombre AS tipo_curso_nombre, 
  //       c.duracion_horas AS horas, 
  //       c.descripcion AS detalles
  //     FROM cursos c
  //     JOIN areas a ON c.area_id = a.id
  //     JOIN especialidades e ON c.especialidad_id = e.id
  //     JOIN tipos_curso t ON c.tipo_curso_id = t.id
  //   `;
  //   const { rows } = await pool.query(query);
  //   return rows;
  // },
  async getDetailedCursos() {
    const query = `
    SELECT 
      c.id, 
      c.estatus, 
      c.area_id, 
      a.nombre AS area_nombre, 
      c.especialidad_id, 
      e.nombre AS especialidad_nombre, 
      c.clave, 
      c.nombre AS curso_nombre, 
      c.tipo_curso_id, 
      t.nombre AS tipo_curso_nombre, 
      c.duracion_horas AS horas, 
      c.descripcion AS detalles
    FROM cursos c
    LEFT JOIN areas a ON c.area_id = a.id
    LEFT JOIN especialidades e ON c.especialidad_id = e.id
    JOIN tipos_curso t ON c.tipo_curso_id = t.id
  `;
    const { rows } = await pool.query(query);
    return rows;
  },
  async updateStatus(id) {
    const querySelect = `
      SELECT estatus
      FROM cursos
      WHERE id = $1;
    `;
    const {
      rows: [curso],
    } = await pool.query(querySelect, [id]);

    if (!curso) {
      return null; // Si el curso no existe
    }

    const nuevoEstatus = !curso.estatus; // Invierte el valor actual
    const queryUpdate = `
      UPDATE cursos
      SET estatus = $1
      WHERE id = $2
      RETURNING *;
    `;
    const values = [nuevoEstatus, id];
    const { rows } = await pool.query(queryUpdate, values);
    return rows[0]; // Devuelve el curso actualizado
  },

  async getCursosByIdDocente(idUsuario) {
    try {
      // Obtener el ID del docente a partir del ID del usuario
      const docente = await pool.query(
        "SELECT id FROM docentes WHERE id_usuario = $1",
        [idUsuario]
      );

      if (docente.rows.length === 0) {
        // Si no se encuentra el docente, retornar un array vacío
        return [];
      }

      const idDocente = docente.rows[0].id;

      // Realizar la consulta de los cursos utilizando el ID del docente
      const query = `
     SELECT 
  c.id, 
  c.nombre, 
  c.clave,
  c.duracion_horas,
  c.descripcion,
  c.area_id,
  a.nombre AS area_nombre,
  c.especialidad_id,
  e.nombre AS especialidad_nombre,
  c.tipo_curso_id,
  c.estatus,
  t.nombre AS tipo_curso_nombre,
  c.vigencia_inicio,
  c.fecha_publicacion,
  c.ultima_actualizacion,
  pc.plantel_id,
  pc.horario, -- Now included in GROUP BY
  p.nombre AS plantel_nombre,
  COUNT(ac.alumno_id) AS cantidad_alumnos,
  AVG(ac.calificacion_final) AS promedio_calificaciones,
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
FROM 
  cursos c
JOIN 
  cursos_docentes cd ON c.id = cd.curso_id
JOIN 
  areas a ON c.area_id = a.id
JOIN 
  especialidades e ON c.especialidad_id = e.id
JOIN 
  tipos_curso t ON c.tipo_curso_id = t.id
JOIN 
  planteles_cursos pc ON c.id = pc.curso_id
JOIN 
  planteles p ON pc.plantel_id = p.id
LEFT JOIN 
  alumnos_cursos ac ON c.id = ac.curso_id
WHERE 
  cd.docente_id = $1 AND cd.estatus = true
GROUP BY 
  c.id, p.nombre, pc.plantel_id, pc.horario, a.nombre, e.nombre, t.nombre, pc.fecha_inicio, pc.fecha_fin;
`;

      const { rows } = await pool.query(query, [idDocente]);
      return rows;
    } catch (error) {
      console.error("Error al obtener cursos por ID de docente:", error);
      throw error;
    }
  },
};

module.exports = CursosModel;
