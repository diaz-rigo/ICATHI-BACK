const CursosModel = require("../models/cursosModel");
const pool = require("../config/database");

const cloudinary = require("../config/cloudinary");
const fs = require("fs");

exports.getAll = async (req, res) => {
  try {
    const cursos = await CursosModel.getAll();
    res.status(200).json(cursos);
  } catch (error) {
    console.error("Error al obtener los cursos:", error);
    res.status(500).json({ error: "Error al obtener los cursos" });
  }
};

exports.getAllByIdPlantel = async (req, res) => {
  try {
    const { idPlantel } = req.params;

    const cursos = await CursosModel.getAllByIdPlantel(idPlantel);
    res.status(200).json(cursos);
  } catch (error) {
    console.error("Error al obtener los cursos:", error);
    res.status(500).json({ error: "Error al obtener los cursos" });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const curso = await CursosModel.getById(id);
    if (!curso) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    res.status(200).json(curso);
  } catch (error) {
    console.error("Error al obtener el curso:", error);
    res.status(500).json({ error: "Error al obtener el curso" });
  }
};

exports.getByIdInfoReporte = async (req, res) => {
  console.log("pdf");
  try {
    const { id } = req.params;

    // Obtener datos del curso (incluyendo el nombre del tipo de curso)
    const datosCurso = await CursosModel.getByIdInfoReporte(id);

    // Validar si no se encontró el curso
    if (!datosCurso) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }

    // Definir valores predeterminados en caso de que no existan materiales o equipamiento
    const materiales =
      datosCurso.materiales === "vacío o 0"
        ? "vacío o 0"
        : datosCurso.materiales;
    const equipamiento =
      datosCurso.equipamiento === "vacío o 0"
        ? "vacío o 0"
        : datosCurso.equipamiento;

    // Obtener detalles de las firmas (elaborado_por, revisado_por, autorizado_por)
    const firmasQuery = `
      SELECT id, nombre, cargo, tipo_firma
      FROM firmas
      WHERE id IN ($1, $2, $3)
    `;
    const firmasResult = await pool.query(firmasQuery, [
      datosCurso.elaborado_por,
      datosCurso.revisado_por,
      datosCurso.autorizado_por,
    ]);

    const firmasPorId = {};
    firmasResult.rows.forEach((firma) => {
      firmasPorId[firma.id] = {
        nombre: firma.nombre || "",
        cargo: firma.cargo || "",
      };
    });

    // Determinar etiquetas dinámicas según el tipo de curso
    const etiquetasCurso = {
      1: {
        ETIQUETA_BIBLIOGRAFIA: "BIBLIOGRAFÍA",
        ETIQUETA_CRITERIOS: "CRITERIOS DE ACREDITACIÓN",
        ETIQUETA_RECONOCIMIENTO: "RECONOCIMIENTO A LA PERSONA EGRESADA",
      },
      2: {
        ETIQUETA_BIBLIOGRAFIA: "BIBLIOGRAFÍA",
        ETIQUETA_CRITERIOS:
          "REQUISITOS TÉCNICOS PARA EL ESTUDIO O TUTORÍA EN LÍNEA",
        ETIQUETA_RECONOCIMIENTO: "RECONOCIMIENTO AL ALUMNO",
      },
      3: {
        ETIQUETA_BIBLIOGRAFIA: "BIBLIOGRAFÍA / WEBGRAFÍA",
        ETIQUETA_CRITERIOS: "CRITERIOS DE ACREDITACIÓN",
        ETIQUETA_RECONOCIMIENTO: "RECONOCIMIENTO A LA PERSONA EGRESADA",
      },
    };

    // Obtener el conjunto de etiquetas según el tipo de curso
    const etiquetas =
      etiquetasCurso[datosCurso.tipo_curso_id] || etiquetasCurso[1];
    // Obtener el contenido programático del curso
    const contenidoProgramaticoQuery = `
      SELECT 
        id, tema_nombre, tiempo, competencias, evaluacion, actividades
      FROM contenido_programatico
      WHERE id_curso = $1
    `;
    //   const firmasResult = await pool.query(firmasQuery, [
    //   datosCurso.elaborado_por,
    //   datosCurso.revisado_por,
    //   datosCurso.autorizado_por,
    // ]);

    const contenidoProgramaticoResult = await pool.query(
      contenidoProgramaticoQuery,
      [datosCurso.id]
    );

    // Construir el objeto de respuesta
    const response = {
      Id_Curso: datosCurso.id,
      NOMBRE: datosCurso.nombre || "No disponible",
      CLAVE: datosCurso.clave || "No disponible",
      DURACION_HORAS: datosCurso.duracion_horas || "No disponible",
      DESCRIPCION: datosCurso.descripcion || "No disponible",
      AREA_ID: datosCurso.area_id || "No disponible",
      ESPECIALIDAD_ID: datosCurso.especialidad_id || "No disponible",
      TIPO_CURSO_ID: datosCurso.tipo_curso_id, // ID del tipo de curso
      TIPO_CURSO: datosCurso.tipo_curso, // Nombre del tipo de curso
      VIGENCIA_INICIO: datosCurso.vigencia_inicio || "No disponible",
      FECHA_PUBLICACION: datosCurso.fecha_publicacion || "No disponible",
      FECHA_VALIDACION: datosCurso.fecha_validacion || "No disponible",
      // FECHA_VALIDACION: datosCurso.fecha_validacion || "No disponible",

      version_formato: datosCurso.version_formato || 0,
      fecha_emision_formato: datosCurso.fecha_emision_formato || "No disponible",
      codigo_formato: datosCurso.codigo_formato || "No disponible",
      reviso_aprobo_texto: datosCurso.reviso_aprobo_texto || "No disponible",

      firmas: {
        REVISADO_POR: firmasPorId[datosCurso.revisado_por] || {
          nombre: "",
          cargo: "",
        },
        AUTORIZADO_POR: firmasPorId[datosCurso.autorizado_por] || {
          nombre: "",
          cargo: "",
        },
        ELABORADO_POR: firmasPorId[datosCurso.elaborado_por] || {
          nombre: "",
          cargo: "",
        },
      },
      USUARIO_VALIDADOR_ID: datosCurso.usuario_validador_id || "No disponible",
      CONTENIDOPROGRAMATICO: contenidoProgramaticoResult.rows,

      FICHA_TECNICA: {
        OBJETIVO: datosCurso.objetivo || "No disponible",
        PERFIL_INGRESO: datosCurso.perfil_ingreso || "No disponible",
        PERFIL_EGRESO: datosCurso.perfil_egreso || "No disponible",
        PERFIL_DEL_DOCENTE: datosCurso.perfil_del_docente || "No disponible",
        METODOLOGIA: datosCurso.metodologia || "No disponible",
        // Estructura con las etiquetas, valores y datos
        ETIQUETAS: [
          {
            NOMBRE: etiquetas.ETIQUETA_BIBLIOGRAFIA,
            VALOR: "Bibliografía",
            DATO: datosCurso.bibliografia || "No disponible",
          },
          {
            NOMBRE: etiquetas.ETIQUETA_CRITERIOS,
            VALOR: "Criterios de Acreditación",
            DATO: datosCurso.criterios_acreditacion || "No disponible",
          },
          {
            NOMBRE: etiquetas.ETIQUETA_RECONOCIMIENTO,
            VALOR: "Reconocimiento",
            DATO: datosCurso.reconocimiento || "No disponible",
          },
        ],
      },

      MATERIALES: (() => {
        if (
          !materiales ||
          materiales.every(
            (m) =>
              m.material_cantidad_10 === 0 &&
              m.material_cantidad_15 === 0 &&
              m.material_cantidad_20 === 0
          )
        ) {
          return 0;
        }
        return materiales.map((m) => ({
          material_descripcion: m.material_descripcion || "No disponible",
          material_unidad_de_medida:
            m.material_unidad_de_medida || "No disponible",
          material_cantidad_10: m.material_cantidad_10 || 0,
          material_cantidad_15: m.material_cantidad_15 || 0,
          material_cantidad_20: m.material_cantidad_20 || 0,
        }));
      })(),
      NOTA_MATERIALES: datosCurso.nota_materiales || "No disponible",

      // c.nota_materiales,
      EQUIPAMIENTO: (() => {
        if (
          !equipamiento ||
          equipamiento.every(
            (e) =>
              e.equipamiento_cantidad_10 === 0 &&
              e.equipamiento_cantidad_15 === 0 &&
              e.equipamiento_cantidad_20 === 0
          )
        ) {
          return 0;
        }
        return equipamiento.map((e) => ({
          equipamiento_descripcion:
            e.equipamiento_descripcion || "No disponible",
          equipamiento_unidad_de_medida:
            e.equipamiento_unidad_de_medida || "No disponible",
          equipamiento_cantidad_10: e.equipamiento_cantidad_10 || 0,
          equipamiento_cantidad_15: e.equipamiento_cantidad_15 || 0,
          equipamiento_cantidad_20: e.equipamiento_cantidad_20 || 0,
        }));
      })(),
    };

    // Responder con los datos del curso
    res.status(200).json(response);
  } catch (error) {
    console.error("Error al obtener el curso:", error);
    res.status(500).json({ error: "Error al obtener el curso" });
  }
};

// exports.create = async (req, res) => {
//   const client = await pool.connect();
//   let uploadResult = null;

//   try {
//     console.log(
//       "Datos recibidos del frontend  para la creacion_____:",
//       req.body
//     );

//     const {
//       nombre,
//       clave,
//       duracion_horas,
//       descripcion,
//       costo,
//       nivel,
//       area_id,
//       especialidad_id,
//       tipo_curso_id,
//       vigencia_inicio,
//       fecha_publicacion,
//       ultima_actualizacion,
//       revisado_por,
//       cargo_revisado_por,
//       autorizado_por,
//       cargo_autorizado_por,
//       elaborado_por,
//       cargo_elaborado_por,
//       objetivos,
//       materiales,
//       equipamiento,
//       contenidoProgramatico,
//       archivo_url,
//       nota_materiales,
//       nota_equipamiento,
//       codigo_formato,
//       version_formato,
//       fecha_emision_formato,
//       reviso_aprobo_texto
//     } = req.body;

//     // Validaciones básicas
//     if (
//       !nombre ||
//       !clave ||
//       !duracion_horas ||
//       !descripcion ||
//       !tipo_curso_id
//     ) {
//       return res
//         .status(400)
//         .json({ error: "Los campos obligatorios deben completarse" });
//     }
//     // Convertir '0' a null para area_id y especialidad_id
//     const areaId = area_id === '0' ? null : area_id;
//     const especialidadId = especialidad_id === '0' ? null : especialidad_id;
//     // Validar firmantes
//     if (!revisado_por || !autorizado_por || !elaborado_por) {
//       return res
//         .status(400)
//         .json({ error: "Debe especificar todos los firmantes" });
//     }

//     if (!cargo_revisado_por || !cargo_autorizado_por || !cargo_elaborado_por) {
//       return res
//         .status(400)
//         .json({ error: "Debe especificar los cargos de todos los firmantes" });
//     }

//     await client.query("BEGIN");

//     // Obtener o crear firmas
//     const firmaIds = {
//       revisado: await obtenerOcrearFirma(
//         client,
//         revisado_por,
//         cargo_revisado_por,
//         "Revisado"
//       ),
//       autorizado: await obtenerOcrearFirma(
//         client,
//         autorizado_por,
//         cargo_autorizado_por,
//         "Autorizado"
//       ),
//       elaborado: await obtenerOcrearFirma(
//         client,
//         elaborado_por,
//         cargo_elaborado_por,
//         "Elaborado"
//       ),
//     };

//     // Resto del código de inserción (curso, ficha técnica, materiales, etc.) permanece igual
//     // ... [código existente]
//     const parseJSON = (data) =>
//       typeof data === "string" ? JSON.parse(data) : data;
//     const parsedObjetivos = parseJSON(objetivos) || {};
//     const parsedMateriales = parseJSON(materiales) || [];
//     const parsedEquipamiento = parseJSON(equipamiento) || [];
//     const parsedContenidoProgramatico = parseJSON(contenidoProgramatico) || {
//       temas: [],
//     };

//     // Inserta curso
//     const cursoQuery = `
//       INSERT INTO cursos (
//         nombre, clave, duracion_horas, descripcion, nivel, costo, area_id, especialidad_id, tipo_curso_id, 
//         vigencia_inicio, fecha_publicacion, ultima_actualizacion, revisado_por, autorizado_por, elaborado_por,archivo_url ,
//         nota_materiales, nota_equipamiento
//       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,$16,$17,$18,
//           $19, $20, $21, $22

//       ) RETURNING id
//     `;

//     const cursoValues = [
//       nombre,
//       clave,
//       duracion_horas,
//       descripcion,
//       nivel || "Básico",
//       costo,
//       area_id || null,
//       especialidad_id || null,
//       tipo_curso_id,
//       vigencia_inicio || null,
//       fecha_publicacion || null,
//       ultima_actualizacion || null,
//       firmaIds.revisado, // Usar el ID de la firma "Revisado"
//       firmaIds.autorizado, // Usar el ID de la firma "Autorizado"
//       firmaIds.elaborado, // Usar el ID de la firma "Elaborado"
//       archivo_url || null, // Nuevo valor añadido
//       nota_materiales,
//       nota_equipamiento,
//       codigo_formato || null,
//       version_formato || 1,
//       fecha_emision_formato || null,
//       reviso_aprobo_texto || null
//     ];

//     const { rows: cursoRows } = await client.query(cursoQuery, cursoValues);
//     const id_curso = cursoRows[0].id;

//     // Inserta ficha técnica
//     const fichaTecnicaParams = {
//       id_curso,
//       objetivo: parsedObjetivos.objetivo || "N/C",
//       perfil_ingreso: parsedObjetivos.perfil_ingreso || "N/C",
//       perfil_egreso: parsedObjetivos.perfil_egreso || "N/C",
//       perfil_del_docente: parsedObjetivos.perfil_del_docente || "N/C",
//       metodologia: parsedObjetivos.metodologia || "N/C",
//       bibliografia: parsedObjetivos.bibliografia || "N/C",
//       criterios_acreditacion: parsedObjetivos.criterios_acreditacion || "N/C",
//       reconocimiento: parsedObjetivos.reconocimiento || "N/C",
//     };

//     await client.query(
//       `INSERT INTO ficha_tecnica 
//        (id_curso, objetivo, perfil_ingreso, perfil_egreso, perfil_del_docente, metodologia,
//         bibliografia, criterios_acreditacion, reconocimiento) 
//        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
//       Object.values(fichaTecnicaParams)
//     );

//     // Inserta materiales
//     for (const material of parsedMateriales) {
//       const materialParams = {
//         id_curso,
//         descripcion: material.descripcion || "N/C",
//         unidad_de_medida: material.unidad_de_medida || "N/C",
//         cantidad_10: material.cantidad10 || 0,
//         cantidad_15: material.cantidad15 || 0,
//         cantidad_20: material.cantidad20 || 0,
//       };

//       await client.query(
//         `INSERT INTO material 
//          (id_curso, descripcion, unidad_de_medida, cantidad_10, cantidad_15, cantidad_20) 
//          VALUES ($1, $2, $3, $4, $5, $6)`,
//         Object.values(materialParams)
//       );
//     }

//     // Inserta equipamiento
//     for (const equipo of parsedEquipamiento) {
//       const equipamientoParams = {
//         id_curso,
//         descripcion: equipo.descripcion || "N/C",
//         unidad_de_medida: equipo.unidad_de_medida || "OTRO",
//         cantidad_10: equipo.cantidad10 || 0,
//         cantidad_15: equipo.cantidad15 || 0,
//         cantidad_20: equipo.cantidad20 || 0,
//       };

//       await client.query(
//         `INSERT INTO equipamiento 
//          (id_curso, descripcion, unidad_de_medida, cantidad_10, cantidad_15, cantidad_20) 
//          VALUES ($1, $2, $3, $4, $5, $6)`,
//         Object.values(equipamientoParams)
//       );
//     }

//     // Inserta contenido programático
//     for (const tema of parsedContenidoProgramatico.temas) {
//       const contenidoParams = {
//         id_curso,
//         tema_nombre: tema.tema_nombre || "N/C",
//         tiempo: tema.tiempo || 0,
//         competencias: tema.competencias || null,
//         evaluacion: tema.evaluacion || null,
//         actividades: tema.actividades || null,
//       };

//       await client.query(
//         `INSERT INTO contenido_programatico 
//          (id_curso, tema_nombre, tiempo, competencias, evaluacion, actividades) 
//          VALUES ($1, $2, $3, $4, $5, $6)`,
//         Object.values(contenidoParams)
//       );
//     }

//     // Insertar registro de autorización
//     const autorizacionQuery = `
//       INSERT INTO autorizaciones (
//         elaborado_por, revisado_por, autorizado_por, curso_id, fecha_vigencia
//       ) VALUES ($1, $2, $3, $4, $5)
//     `;
//     await client.query(autorizacionQuery, [
//       firmaIds.elaborado,
//       firmaIds.revisado,
//       firmaIds.autorizado,
//       id_curso,
//       vigencia_inicio || null,
//     ]);

//     await client.query("COMMIT");
//     res
//       .status(201)
//       .json({ message: "Curso registrado exitosamente", id_curso });
//   } catch (error) {
//     await client.query("ROLLBACK");
//     console.error("Error al registrar el curso:", error);

//     if (uploadResult?.public_id) {
//       try {
//         await cloudinary.uploader.destroy(uploadResult.public_id);
//       } catch (e) {
//         console.error("Error al eliminar archivo de Cloudinary:", e);
//       }
//     }

//     res.status(500).json({
//       error: "Error al registrar el curso",
//       details: error.message,
//       stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
//     });
//   } finally {
//     client.release();
//   }
// };

exports.create = async (req, res) => {
  const client = await pool.connect();
  let uploadResult = null;

  try {
    console.log(
      "Datos recibidos del frontend  para la creacion__2025___:",
      req.body
    );

    const {
      nombre,
      clave,
      duracion_horas,
      descripcion,
      costo,
      nivel,
      area_id,
      especialidad_id,
      tipo_curso_id,
      vigencia_inicio,
      fecha_publicacion,
      ultima_actualizacion,
      revisado_por,
      cargo_revisado_por,
      autorizado_por,
      cargo_autorizado_por,
      elaborado_por,
      cargo_elaborado_por,
      objetivos,
      materiales,
      equipamiento,
      contenidoProgramatico,
      archivo_url,
      nota_materiales,
      nota_equipamiento,
      codigo_formato,
      version_formato,
      fecha_emision_formato,
      reviso_aprobo_texto
    } = req.body;

    // Validaciones básicas
    if (
      !nombre ||
      !clave ||
      !duracion_horas ||
      !descripcion ||
      !tipo_curso_id
    ) {
      return res
        .status(400)
        .json({ error: "Los campos obligatorios deben completarse" });
    }
    // Convertir '0' a null para area_id y especialidad_id
    const areaId = area_id === '0' ? null : area_id;
    const especialidadId = especialidad_id === '0' ? null : especialidad_id;
    // Validar firmantes
    if (!revisado_por || !autorizado_por || !elaborado_por) {
      return res
        .status(400)
        .json({ error: "Debe especificar todos los firmantes" });
    }

    if (!cargo_revisado_por || !cargo_autorizado_por || !cargo_elaborado_por) {
      return res
        .status(400)
        .json({ error: "Debe especificar los cargos de todos los firmantes" });
    }

    await client.query("BEGIN");

    // Obtener o crear firmas
    const firmaIds = {
      revisado: await obtenerOcrearFirma(
        client,
        revisado_por,
        cargo_revisado_por,
        "Revisado"
      ),
      autorizado: await obtenerOcrearFirma(
        client,
        autorizado_por,
        cargo_autorizado_por,
        "Autorizado"
      ),
      elaborado: await obtenerOcrearFirma(
        client,
        elaborado_por,
        cargo_elaborado_por,
        "Elaborado"
      ),
    };

    // Resto del código de inserción (curso, ficha técnica, materiales, etc.) permanece igual
    // ... [código existente]
    const parseJSON = (data) =>
      typeof data === "string" ? JSON.parse(data) : data;
    const parsedObjetivos = parseJSON(objetivos) || {};
    const parsedMateriales = parseJSON(materiales) || [];
    const parsedEquipamiento = parseJSON(equipamiento) || [];
    const parsedContenidoProgramatico = parseJSON(contenidoProgramatico) || {
      temas: [],
    };

    // Inserta curso
    const cursoQuery = `
      INSERT INTO cursos (
        nombre, clave, duracion_horas, descripcion, nivel, costo, area_id, especialidad_id, tipo_curso_id, 
        vigencia_inicio, fecha_publicacion, ultima_actualizacion, revisado_por, autorizado_por, elaborado_por,archivo_url ,
        nota_materiales, nota_equipamiento
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,$16,$17,$18,
          $19, $20, $21, $22
  
      ) RETURNING id
    `;

    const cursoValues = [
      nombre,
      clave,
      duracion_horas,
      descripcion,
      nivel || "Básico",
      costo,
      area_id || null,
      especialidad_id || null,
      tipo_curso_id,
      vigencia_inicio || null,
      fecha_publicacion || null,
      ultima_actualizacion || null,
      firmaIds.revisado, // Usar el ID de la firma "Revisado"
      firmaIds.autorizado, // Usar el ID de la firma "Autorizado"
      firmaIds.elaborado, // Usar el ID de la firma "Elaborado"
      archivo_url || null, // Nuevo valor añadido
      nota_materiales,
      nota_equipamiento,
      codigo_formato || null,
      version_formato || 1,
      fecha_emision_formato || null,
      reviso_aprobo_texto || null
    ];

    const { rows: cursoRows } = await client.query(cursoQuery, cursoValues);
    const id_curso = cursoRows[0].id;

    // Inserta ficha técnica
    const fichaTecnicaParams = {
      id_curso,
      objetivo: parsedObjetivos.objetivo || "N/C",
      perfil_ingreso: parsedObjetivos.perfil_ingreso || "N/C",
      perfil_egreso: parsedObjetivos.perfil_egreso || "N/C",
      perfil_del_docente: parsedObjetivos.perfil_del_docente || "N/C",
      metodologia: parsedObjetivos.metodologia || "N/C",
      bibliografia: parsedObjetivos.bibliografia || "N/C",
      criterios_acreditacion: parsedObjetivos.criterios_acreditacion || "N/C",
      reconocimiento: parsedObjetivos.reconocimiento || "N/C",
      presentacion: parsedObjetivos.presentacion || "N/C",
      objetivo_especialidad: parsedObjetivos.objetivo_especialidad || "N/C",
      aplicacion_laboral: parsedObjetivos.aplicacion_laboral || "N/C",
      directorio: parsedObjetivos.directorio || "N/C",
    };

    await client.query(
      `INSERT INTO ficha_tecnica 
       (id_curso, objetivo, perfil_ingreso, perfil_egreso, perfil_del_docente, metodologia,
        bibliografia, criterios_acreditacion,   
         reconocimiento,
          presentacion,
          objetivo_especialidad,
          aplicacion_laboral,
          directorio) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      Object.values(fichaTecnicaParams)
    );

    // Inserta materiales
    for (const material of parsedMateriales) {
      const materialParams = {
        id_curso,
        descripcion: material.descripcion || "N/C",
        unidad_de_medida: material.unidad_de_medida || "N/C",
        cantidad_10: material.cantidad10 || 0,
        cantidad_15: material.cantidad15 || 0,
        cantidad_20: material.cantidad20 || 0,
      };

      await client.query(
        `INSERT INTO material 
         (id_curso, descripcion, unidad_de_medida, cantidad_10, cantidad_15, cantidad_20) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        Object.values(materialParams)
      );
    }

    // Inserta equipamiento
    for (const equipo of parsedEquipamiento) {
      const equipamientoParams = {
        id_curso,
        descripcion: equipo.descripcion || "N/C",
        unidad_de_medida: equipo.unidad_de_medida || "OTRO",
        cantidad_10: equipo.cantidad10 || 0,
        cantidad_15: equipo.cantidad15 || 0,
        cantidad_20: equipo.cantidad20 || 0,
      };

      await client.query(
        `INSERT INTO equipamiento 
         (id_curso, descripcion, unidad_de_medida, cantidad_10, cantidad_15, cantidad_20) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        Object.values(equipamientoParams)
      );
    }

    // Inserta contenido programático
    for (const tema of parsedContenidoProgramatico.temas) {
      const contenidoParams = {
        id_curso,
        tema_nombre: tema.tema_nombre || "N/C",
        tiempo: tema.tiempo || 0,
        competencias: tema.competencias || null,
        evaluacion: tema.evaluacion || null,
        actividades: tema.actividades || null,
      };

      await client.query(
        `INSERT INTO contenido_programatico 
         (id_curso, tema_nombre, tiempo, competencias, evaluacion, actividades) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        Object.values(contenidoParams)
      );
    }

    // Insertar registro de autorización
    const autorizacionQuery = `
      INSERT INTO autorizaciones (
        elaborado_por, revisado_por, autorizado_por, curso_id, fecha_vigencia
      ) VALUES ($1, $2, $3, $4, $5)
    `;
    await client.query(autorizacionQuery, [
      firmaIds.elaborado,
      firmaIds.revisado,
      firmaIds.autorizado,
      id_curso,
      vigencia_inicio || null,
    ]);

    await client.query("COMMIT");
    res
      .status(201)
      .json({ message: "Curso registrado exitosamente", id_curso });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al registrar el curso:", error);

    if (uploadResult?.public_id) {
      try {
        await cloudinary.uploader.destroy(uploadResult.public_id);
      } catch (e) {
        console.error("Error al eliminar archivo de Cloudinary:", e);
      }
    }

    res.status(500).json({
      error: "Error al registrar el curso",
      details: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  } finally {
    client.release();
  }
};

// Función auxiliar (puede ir en otro archivo de helpers)
async function obtenerOcrearFirma(client, nombre, cargo, tipo) {
  const { rows: existing } = await client.query(
    `SELECT id FROM firmas WHERE nombre = $1 AND cargo = $2 AND tipo_firma = $3 LIMIT 1`,
    [nombre, cargo, tipo]
  );

  if (existing.length > 0) {
    return existing[0].id;
  }

  const { rows: newFirma } = await client.query(
    `INSERT INTO firmas (nombre, cargo, tipo_firma) VALUES ($1, $2, $3) RETURNING id`,
    [nombre, cargo, tipo]
  );

  return newFirma[0].id;
}

exports.update = async (req, res) => {
  console.log("updATE 2");
  try {
    const { id } = req.params;
    const {
      nombre,
      clave,
      duracion_horas,
      descripcion,
      area_id,
      especialidad_id,
      tipo_curso_id,
      estatus,
    } = req.body;
    // Validar campos obligatorios
    if (
      !nombre ||
      !duracion_horas ||
      !descripcion ||
      !area_id ||
      !especialidad_id ||
      !tipo_curso_id
    ) {
      return res
        .status(400)
        .json({ error: "Todos los campos obligatorios deben ser completados" });
    }

    console.log("Datos recibidos para actualización:", req.body); // Para depuración

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
      nombre,
      clave || null,
      duracion_horas,
      descripcion,
      area_id,
      especialidad_id,
      tipo_curso_id,
      null,
      null,
      null,
      estatus,
      id,
    ];

    console.log("Consulta SQL:", query); // Log de la consulta
    console.log("Valores de la consulta:", values); // Log de los valores

    const { rows } = await pool.query(query, values);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error al actualizar el curso:", error);
    res
      .status(500)
      .json({ error: "Error al actualizar el curso", details: error.message });
  }
};
exports.delete = async (req, res) => {
  try {
    const { id } = req.params; // Obtiene el ID del curso a eliminar
    const cursoEliminado = await CursosModel.delete(id); // Llama al modelo para eliminar el curso

    if (!cursoEliminado) {
      return res.status(404).json({ error: "Curso no encontrado" }); // Si no se encuentra el curso, devuelve 404
    }

    res.status(200).json(cursoEliminado); // Devuelve el curso eliminado
  } catch (error) {
    console.error("Error al eliminar el curso:", error); // Log del error
    res.status(500).json({ error: "Error al eliminar el curso" }); // Devuelve un error 500
  }
};

// Método para actualizar el campo 'validado' de un curso
exports.updateValidado = async (req, res) => {
  try {
    const { id } = req.params;
    const { validado, estatus } = req.body; // Asegúrate de recibir estatus

    // Validar que 'validado' sea booleano
    if (typeof validado !== "boolean" || typeof estatus !== "boolean") {
      return res.status(400).json({
        error:
          'Los campos "validado" y "estatus" son obligatorios y deben ser booleanos',
      });
    }

    const cursoActualizado = await CursosModel.updateValidado(
      id,
      validado,
      estatus
    ); // Asegúrate de pasar estatus
    if (!cursoActualizado) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }
    res.status(200).json(cursoActualizado);
  } catch (error) {
    console.error("Error al actualizar el estado validado del curso:", error);
    res
      .status(500)
      .json({ error: "Error al actualizar el estado validado del curso" });
  }
};

// Método para obtener cursos por estatus
exports.getByStatus = async (req, res) => {
  try {
    const { estatus } = req.params;

    // Validar que 'estatus' sea booleano
    if (estatus !== "true" && estatus !== "false") {
      return res
        .status(400)
        .json({ error: 'El campo "estatus" debe ser "true" o "false"' });
    }

    const cursos = await CursosModel.getByStatus(estatus === "true");
    res.status(200).json(cursos);
  } catch (error) {
    console.error("Error al obtener los cursos por estatus:", error);
    res.status(500).json({ error: "Error al obtener los cursos por estatus" });
  }
};

exports.getCursosByAreaIdByEspecialidadId = async (req, res) => {
  try {
    const { areaId, especialidadId } = req.query;
    const cursos = await CursosModel.getCursosByAreaIdByEspecialidadId(
      areaId,
      especialidadId
    );
    res.status(200).json(cursos);
  } catch (error) {
    console.error("Error al obtener los cursos:", error);
    res.status(500).json({ error: "Error al obtener los cursos" });
  }
};

exports.getDetailedCursos = async (req, res) => {
  try {
    const cursos = await CursosModel.getDetailedCursos();
    res.status(200).json(cursos);
  } catch (error) {
    console.error("Error al obtener los cursos detallados:", error);
    res.status(500).json({ error: "Error al obtener los cursos detallados" });
  }
};

exports.getCursosByEspecialidadId = async (req, res) => {
  try {
    const especialidadId = Number(req.params.especialidadId);
    const plantelId = Number(req.params.plantelId);
    const cursos = await CursosModel.getCursosByEspecialidadId(
      especialidadId,
      plantelId
    );
    res.status(200).json(cursos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los cursos" });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const cursoActualizado = await CursosModel.updateStatus(id);
    if (!cursoActualizado) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }

    res.status(200).json(cursoActualizado);
  } catch (error) {
    console.error("Error al actualizar el estatus del curso:", error);
    res.status(500).json({ error: "Error al actualizar el estatus del curso" });
  }
};

exports.getAllByIdDocente = async (req, res) => {
  try {
    const { idDocente } = req.params;
    const cursos = await CursosModel.getCursosByIdDocente(idDocente);
    res.status(200).json(cursos);
  } catch (error) {
    console.error(`Error al obtener los cursos del docente`, error);
    res.status(500).json({ error: "Error al obtener los cursos" });
  }
};
exports.getCourseDetails = async (req, res) => {
  const { id } = req.params; // ID del curso a buscar
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Obtener datos básicos del curso
    const cursoQuery = `
      SELECT 
        c.id, c.nombre, c.clave, c.costo, c.duracion_horas, c.descripcion, c.nivel, 
        c.area_id, c.especialidad_id, c.tipo_curso_id, c.vigencia_inicio, 
        c.fecha_publicacion, c.ultima_actualizacion, c.archivo_url,
        c.elaborado_por, c.revisado_por, c.autorizado_por,
            c.nota_materiales, c.nota_equipamiento, c.nota_requisitos, c.nota_evaluacion
      , c.codigo_formato, c.version_formato, c.fecha_emision_formato, c.reviso_aprobo_texto

      FROM cursos c
      WHERE c.id = $1
    `;
    const cursoResult = await client.query(cursoQuery, [id]);
    console.log("cursoResult", cursoResult);
    if (cursoResult.rows.length === 0) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }

    const curso = cursoResult.rows[0];
    console.log("cursoResult", curso);

    // Obtener la ficha técnica del curso
    const fichaQuery = `
      SELECT 
        id, objetivo, perfil_ingreso, perfil_egreso, perfil_del_docente, 
        metodologia, bibliografia, criterios_acreditacion, reconocimiento
      FROM ficha_tecnica
      WHERE id_curso = $1
    `;
    const fichaResult = await client.query(fichaQuery, [id]);
    const fichaTecnica = fichaResult.rows[0] || {};

    // Obtener el contenido programático del curso
    const contenidoProgramaticoQuery = `
      SELECT 
        id, tema_nombre, tiempo, competencias, evaluacion, actividades
      FROM contenido_programatico
      WHERE id_curso = $1
    `;
    const contenidoProgramaticoResult = await client.query(
      contenidoProgramaticoQuery,
      [id]
    );

    // Obtener los materiales del curso
    const materialesQuery = `
      SELECT 
        id, descripcion, unidad_de_medida, cantidad_10, cantidad_15, cantidad_20
      FROM material
      WHERE id_curso = $1
    `;
    const materialesResult = await client.query(materialesQuery, [id]);

    // Obtener el equipamiento del curso
    const equipamientoQuery = `
      SELECT 
        id, descripcion, unidad_de_medida, cantidad_10, cantidad_15, cantidad_20
      FROM equipamiento
      WHERE id_curso = $1
    `;
    const equipamientoResult = await client.query(equipamientoQuery, [id]);

    // Obtener detalles de las firmas (elaborado_por, revisado_por, autorizado_por)
    const firmasQuery = `
      SELECT 
        id, nombre, cargo, tipo_firma
      FROM firmas
      WHERE id IN ($1, $2, $3)
    `;
    const firmasResult = await client.query(firmasQuery, [
      curso.elaborado_por,
      curso.revisado_por,
      curso.autorizado_por,
    ]);
    console.log("firmasResult", firmasResult);

    const firmasPorId = {};
    firmasResult.rows.forEach((firma) => {
      firmasPorId[firma.id] = {
        nombre: firma.nombre || "",
        cargo: firma.cargo || "",
      };
    });

    // Formar la respuesta con todos los detalles del curso
    const cursoDetalles = {
      ...curso,
      notas: {
        materiales: curso.nota_materiales || "",
        equipamiento: curso.nota_equipamiento || "",
        requisitos: curso.nota_requisitos || "",
        evaluacion: curso.nota_evaluacion || "",
      },
      firmas: {
        revisado: firmasPorId[curso.revisado_por] || { nombre: "", cargo: "" },
        autorizado: firmasPorId[curso.autorizado_por] || {
          nombre: "",
          cargo: "",
        },
        elaborado: firmasPorId[curso.elaborado_por] || {
          nombre: "",
          cargo: "",
        },
      },
      fichaTecnica,
      contenidoProgramatico: contenidoProgramaticoResult.rows,
      materiales: materialesResult.rows,
      equipamiento: equipamientoResult.rows,
    };

    await client.query("COMMIT");
    res.status(200).json(cursoDetalles);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al obtener los detalles del curso:", error);
    res.status(500).json({
      error: error.message || "Error al obtener los detalles del curso",
    });
  } finally {
    client.release();
  }
};

exports.getCursosByEspecialidadId = async (req, res) => {
  try {
    const especialidadId = Number(req.params.especialidadId);
    const plantelId = Number(req.params.plantelId);
    const cursos = await CursosModel.getCursosByEspecialidadId(
      especialidadId,
      plantelId
    );
    res.status(200).json(cursos);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los cursos" });
  }
};

exports.updateCourseDetails = async (req, res) => {
  console.log("updATE 2***");

  const client = await pool.connect();
  try {
    console.log("Datos recibidos del frontend: updateCourseDetailsz", req.body);
    // console.log("Archivo recibido:", req.file);

    const { id } = req.params;
    let {
      nombre,
      clave,
      duracion_horas,
      descripcion,
      costo,
      nivel,
      area_id,
      especialidad_id,
      tipo_curso_id,
      vigencia_inicio,
      fecha_publicacion,
      ultima_actualizacion,
      revisado_por,
      cargo_revisado_por,
      autorizado_por,
      cargo_autorizado_por,
      elaborado_por,
      cargo_elaborado_por,
      objetivos,
      materiales,
      equipamiento,
      contenidoProgramatico,
      nota_materiales,
      nota_equipamiento,
      archivo_url,
      codigo_formato,
      version_formato,
      fecha_emision_formato,
      reviso_aprobo_texto

    } = req.body;
    fecha_emision_formato = fecha_emision_formato && fecha_emision_formato.trim() !== ''
      ? fecha_emision_formato
      : new Date().toISOString().split('T')[0];

    // Función para parsear JSON si es necesario
    const parseJSON = (data) =>
      typeof data === "string" ? JSON.parse(data) : data;
    objetivos = parseJSON(objetivos) || {};
    contenidoProgramatico = parseJSON(contenidoProgramatico);
    materiales = parseJSON(materiales) || [];
    equipamiento = parseJSON(equipamiento) || [];

    await client.query("BEGIN");
    area_id = area_id === '0' ? null : area_id;
    especialidad_id = especialidad_id === '0' ? null : especialidad_id;


    // **Obtener los IDs de las firmas actuales**
    // 1. Obtener firmas actuales del curso
    // 1. Obtener firmas actuales del curso
    const cursoResult = await client.query(
      "SELECT revisado_por, autorizado_por, elaborado_por FROM cursos WHERE id = $1",
      [id]
    );
    const {
      revisado_por: oldRevisadoPor,
      autorizado_por: oldAutorizadoPor,
      elaborado_por: oldElaboradoPor,
    } = cursoResult.rows[0];

    // **Insertar nuevas firmas y obtener sus IDs**
    // 2. Manejo de firmas - Estrategia mejorada
    const handleFirmas = async () => {
      const firmas = {
        revisado: { nombre: revisado_por, cargo: cargo_revisado_por, oldId: oldRevisadoPor },
        autorizado: { nombre: autorizado_por, cargo: cargo_autorizado_por, oldId: oldAutorizadoPor },
        elaborado: { nombre: elaborado_por, cargo: cargo_elaborado_por, oldId: oldElaboradoPor }
      };

      const newIds = {};

      for (const [tipo, firma] of Object.entries(firmas)) {
        if (firma.nombre && firma.cargo) {
          // Caso 1: Actualizar firma existente si los datos cambiaron
          if (firma.oldId) {
            const existingFirma = await client.query(
              "SELECT nombre, cargo FROM firmas WHERE id = $1",
              [firma.oldId]
            );

            if (existingFirma.rows.length > 0) {
              const current = existingFirma.rows[0];
              if (current.nombre !== firma.nombre || current.cargo !== firma.cargo) {
                await client.query(
                  "UPDATE firmas SET nombre = $1, cargo = $2 WHERE id = $3",
                  [firma.nombre, firma.cargo, firma.oldId]
                );
              }
              newIds[tipo] = firma.oldId;
              continue;
            }
          }

          // Caso 2: Crear nueva firma si no existe o no se puede actualizar
          const result = await client.query(
            "INSERT INTO firmas (nombre, cargo, tipo_firma) VALUES ($1, $2, $3) RETURNING id",
            [firma.nombre, firma.cargo, `${tipo}_por`]
          );
          newIds[tipo] = result.rows[0].id;
        } else if (firma.oldId) {
          // Caso 3: Mantener firma existente si no se proporcionan nuevos datos
          newIds[tipo] = firma.oldId;
        } else {
          // Caso 4: No hay firma (null)
          newIds[tipo] = null;
        }
      }

      return newIds;
    };
    const newFirmaIds = await handleFirmas();

    await client.query(
      `UPDATE cursos 
   SET nombre = $1, clave = $2, duracion_horas = $3, descripcion = $4, nivel = $5, costo = $6,
       area_id = $7, especialidad_id = $8, tipo_curso_id = $9, vigencia_inicio = $10, 
       fecha_publicacion = $11, ultima_actualizacion = $12, revisado_por = $13, 
       autorizado_por = $14, elaborado_por = $15, nota_materiales = $16, 
       nota_equipamiento = $17, archivo_url = $18,
       version_formato = $19, fecha_emision_formato = $20, 
       codigo_formato = $21, reviso_aprobo_texto = $22
   WHERE id = $23`,
      [
        nombre,
        clave,
        duracion_horas,
        descripcion,
        nivel || "Básico",
        costo,
        area_id || null,
        especialidad_id || null,
        tipo_curso_id,
        vigencia_inicio || null,
        fecha_publicacion || null,
        ultima_actualizacion || null,
        newFirmaIds.revisado,
        newFirmaIds.autorizado,
        newFirmaIds.elaborado,
        nota_materiales || null,
        nota_equipamiento || null,
        archivo_url || null,
        version_formato || 1,
        fecha_emision_formato || null,
        codigo_formato || null,
        reviso_aprobo_texto || null,
        id
      ]
    );
    // **Eliminar las firmas antiguas**
    const firmasParaEliminar = [];
    if (newFirmaIds.revisado && newFirmaIds.revisado !== oldRevisadoPor) firmasParaEliminar.push(oldRevisadoPor);
    if (newFirmaIds.autorizado && newFirmaIds.autorizado !== oldAutorizadoPor) firmasParaEliminar.push(oldAutorizadoPor);
    if (newFirmaIds.elaborado && newFirmaIds.elaborado !== oldElaboradoPor) firmasParaEliminar.push(oldElaboradoPor);

    for (const idFirma of firmasParaEliminar) {
      if (idFirma) {
        await client.query("DELETE FROM firmas WHERE id = $1", [idFirma]);
      }
    }
    // **Ficha Técnica**
    const fichaExists = await client.query(
      "SELECT 1 FROM ficha_tecnica WHERE id_curso = $1",
      [id]
    );

    const fichaTecnicaParams = {
      id_curso: id,
      objetivo: objetivos.objetivo || "N/C",
      perfil_ingreso: objetivos.perfil_ingreso || "N/C",
      perfil_egreso: objetivos.perfil_egreso || "N/C",
      perfil_del_docente: objetivos.perfil_del_docente || "N/C",
      metodologia: objetivos.metodologia || "N/C",
      bibliografia: objetivos.bibliografia || "N/C",
      criterios_acreditacion: objetivos.criterios_acreditacion || "N/C",
      reconocimiento: objetivos.reconocimiento || "N/C",
    };

    if (fichaExists.rowCount > 0) {
      console.log("La ficha técnica para el curso con ID", id, "ya existe.");
      await client.query(
        `UPDATE ficha_tecnica 
         SET objetivo = $2, perfil_ingreso = $3, perfil_egreso = $4, perfil_del_docente = $5,
             metodologia = $6, bibliografia = $7, criterios_acreditacion = $8, reconocimiento = $9 
         WHERE id_curso = $1`,
        Object.values(fichaTecnicaParams)
      );
    } else {
      console.log("No existe una ficha técnica para el curso con ID", id);
      await client.query(
        `INSERT INTO ficha_tecnica 
         (id_curso, objetivo, perfil_ingreso, perfil_egreso, perfil_del_docente, metodologia,
          bibliografia, criterios_acreditacion, reconocimiento) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        Object.values(fichaTecnicaParams)
      );
    }

    // **Material**

    // **Material**
    if (materiales) {
      try {
        // Parsear materiales si viene como string JSON
        let materialesArray =
          typeof materiales === "string" ? JSON.parse(materiales) : materiales;

        if (!Array.isArray(materialesArray)) {
          materialesArray = [];
        }

        if (materialesArray.length > 0) {
          // Verificar si existen materiales para este curso
          const materialExists = await client.query(
            "SELECT id FROM material WHERE id_curso = $1",
            [id]
          );

          // Obtener IDs de materiales existentes en la base de datos
          const existingIds = materialExists.rows.map((row) => row.id);

          // Obtener IDs de materiales que vienen en la solicitud (que no son null)
          const incomingIds = materialesArray
            .filter((m) => m.id)
            .map((m) => m.id);

          // Identificar materiales a eliminar (están en BD pero no en la solicitud)
          const idsToDelete = existingIds.filter(
            (id) => !incomingIds.includes(id)
          );

          // Eliminar materiales que ya no están en la lista
          if (idsToDelete.length > 0) {
            await client.query(
              "DELETE FROM material WHERE id = ANY($1::int[])",
              [idsToDelete]
            );
          }

          // Procesar cada material (inserción o actualización)
          for (const material of materialesArray) {
            const materialParams = {
              id_curso: id,
              descripcion: material.descripcion || "N/C",
              unidad_de_medida: material.unidad_de_medida || "N/C",
              cantidad_10: material.cantidad10 || material.cantidad_10 || 0,
              cantidad_15: material.cantidad15 || material.cantidad_15 || 0,
              cantidad_20: material.cantidad20 || material.cantidad_20 || 0,
            };

            if (material.id) {
              // Actualizar material existente
              const query = `
                UPDATE material SET
                  descripcion = $2,
                  unidad_de_medida = $3,
                  cantidad_10 = $4,
                  cantidad_15 = $5,
                  cantidad_20 = $6
                WHERE id = $1
              `;
              await client.query(query, [
                material.id,
                ...Object.values(materialParams).slice(1),
              ]);
            } else {
              // Insertar nuevo material
              const query = `
                INSERT INTO material 
                (id_curso, descripcion, unidad_de_medida, cantidad_10, cantidad_15, cantidad_20) 
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id
              `;
              const result = await client.query(
                query,
                Object.values(materialParams)
              );
              // Aquí podrías capturar el nuevo ID si lo necesitas
            }
          }
        } else {
          // Si materialesArray está vacío, eliminar todos los materiales del curso
          await client.query("DELETE FROM material WHERE id_curso = $1", [id]);
        }
      } catch (error) {
        console.error("Error procesando materiales:", error);
        throw error;
      }
    } else {
      console.log("No se proporcionaron materiales para el curso con ID", id);
    }

    // **Equipamiento**
    if (equipamiento && equipamiento.length > 0) {
      const equipamientoExists = await client.query(
        "SELECT 1 FROM equipamiento WHERE id_curso = $1",
        [id]
      );

      if (equipamientoExists.rowCount > 0) {
        console.log("El equipamiento para el curso con ID", id, "ya existe.");
        await client.query("DELETE FROM equipamiento WHERE id_curso = $1", [
          id,
        ]);
      }

      for (const equipo of equipamiento) {
        const equipamientoParams = {
          id_curso: id,
          descripcion: equipo.descripcion || "N/C",
          unidad_de_medida: equipo.unidad_de_medida || "OTRO",
          cantidad_10: equipo.cantidad10 || 0,
          cantidad_15: equipo.cantidad15 || 0,
          cantidad_20: equipo.cantidad20 || 0,
        };

        const query = `
          INSERT INTO equipamiento 
          (id_curso, descripcion, unidad_de_medida, cantidad_10, cantidad_15, cantidad_20) 
          VALUES ($1, $2, $3, $4, $5, $6)
        `;

        await client.query(query, Object.values(equipamientoParams));
      }
    } else {
      console.log("No se proporcionó equipamiento para el curso con ID", id);
    }

    // **Contenido Programático**
    // **Contenido Programático - Optimizado y Profesional**
    // **Manejo Profesional de Contenido Programático (Versión Corregida)**
    if (contenidoProgramatico !== undefined) {
      try {
        await client.query("BEGIN");

        // 1. Parsear y normalizar los datos de entrada
        const contenidoData =
          typeof contenidoProgramatico === "string"
            ? JSON.parse(contenidoProgramatico)
            : contenidoProgramatico;

        const temasArray = Array.isArray(contenidoData)
          ? contenidoData
          : contenidoData?.temas || [];

        // 2. Verificar contenido existente en BD
        const { rows: existingContent } = await client.query(
          `SELECT id FROM contenido_programatico 
       WHERE id_curso = $1`,
          [id]
        );
        const hadPreviousContent = existingContent.length > 0;
        const existingIds = existingContent.map((row) => row.id);

        // 3. Lógica para los diferentes casos
        if (temasArray.length === 0) {
          // Caso 1: Se envía array vacío (eliminar todo si existía)
          if (hadPreviousContent) {
            await client.query(
              `DELETE FROM contenido_programatico 
           WHERE id_curso = $1`,
              [id]
            );
            console.log(
              `🗑️ Eliminado contenido previo (${existingContent.length} temas) del curso ${id}`
            );
          } else {
            console.log(
              `ℹ️ No se modificó contenido programático (curso ${id} no tenía temas)`
            );
          }
        } else {
          // Caso 2: Hay temas para procesar
          const incomingIds = temasArray.filter((t) => t.id).map((t) => t.id);

          // Eliminar temas removidos
          const idsToDelete = existingIds.filter(
            (id) => !incomingIds.includes(id)
          );
          if (idsToDelete.length > 0) {
            await client.query(
              `DELETE FROM contenido_programatico 
           WHERE id = ANY($1::int[]) AND id_curso = $2`,
              [idsToDelete, id]
            );
            console.log(`✂️ Eliminados ${idsToDelete.length} temas obsoletos`);
          }

          // Procesar cada tema (insertar o actualizar)
          const { insertedCount, updatedCount } = await processTopics(
            client,
            id,
            temasArray,
            existingIds
          );

          console.log(
            `🔄 Sincronizado contenido - Nuevos: ${insertedCount}, Actualizados: ${updatedCount}`
          );
        }

        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        console.error("⚠️ Error en contenido programático:", error);
        throw new Error(`Error al procesar contenido: ${error.message}`);
      }
    } else {
      console.log(`ℹ️ No se envió contenido programático (curso ${id})`);
    }

    // Función auxiliar para procesar temas (versión corregida)
    async function processTopics(client, courseId, temasArray, existingIds) {
      let insertedCount = 0;
      let updatedCount = 0;

      await Promise.all(
        temasArray.map(async (tema) => {
          const {
            id: temaId,
            tema_nombre,
            tiempo,
            competencias,
            evaluacion,
            actividades,
          } = tema;
          const values = [
            tema_nombre || "",
            tiempo || 0,
            competencias || null,
            evaluacion || null,
            actividades || null,
          ];

          if (temaId && existingIds.includes(temaId)) {
            // Actualizar tema existente (VERSIÓN CORREGIDA - sin updated_at)
            await client.query({
              text: `UPDATE contenido_programatico SET
          tema_nombre = $1, tiempo = $2, competencias = $3,
          evaluacion = $4, actividades = $5
          WHERE id = $6 AND id_curso = $7`,
              values: [...values, temaId, courseId],
            });
            updatedCount++;
          } else if (!temaId) {
            // Insertar nuevo tema (sin ID)
            await client.query({
              text: `INSERT INTO contenido_programatico 
          (id_curso, tema_nombre, tiempo, competencias, evaluacion, actividades)
          VALUES ($1, $2, $3, $4, $5, $6)`,
              values: [courseId, ...values],
            });
            insertedCount++;
          }
        })
      );

      return { insertedCount, updatedCount };
    }
    await client.query("COMMIT");
    res.status(200).json({ message: "Curso actualizado exitosamente" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al actualizar el curso:", error.stack);
    res
      .status(500)
      .json({ error: error.message || "Error al actualizar el curso" });
  } finally {
    client.release();
  }
};
