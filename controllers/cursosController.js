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

    // Organizar las firmas por tipo
    const firmas = firmasResult.rows.reduce((acc, firma) => {
      acc[firma.tipo_firma.toLowerCase()] = {
        nombre: firma.nombre || "No disponible",
        cargo: firma.cargo || "No disponible",
      };
      return acc;
    }, {});

    // Determinar etiquetas dinámicas según el tipo de curso
    const etiquetasCurso = {
      1: {
        ETIQUETA_BIBLIOGRAFIA: "BIBLIOGRAFÍA",
        ETIQUETA_CRITERIOS: "CRITERIOS DE ACREDITACIÓN",
        ETIQUETA_RECONOCIMIENTO: "RECONOCIMIENTO A LA PERSONA EGRESADA",
      },
      2: {
        ETIQUETA_BIBLIOGRAFIA: "BIBLIOGRAFÍA",
        ETIQUETA_CRITERIOS: "REQUISITOS TÉCNICOS PARA EL ESTUDIO O TUTORÍA EN LÍNEA",
        ETIQUETA_RECONOCIMIENTO: "RECONOCIMIENTO AL ALUMNO",
      },
      3: {
        ETIQUETA_BIBLIOGRAFIA: "BIBLIOGRAFÍA / WEBGRAFÍA",
        ETIQUETA_CRITERIOS: "CRITERIOS DE ACREDITACIÓN",
        ETIQUETA_RECONOCIMIENTO: "RECONOCIMIENTO A LA PERSONA EGRESADA",
      },
    };

    // Obtener el conjunto de etiquetas según el tipo de curso
    const etiquetas = etiquetasCurso[datosCurso.tipo_curso_id] || etiquetasCurso[1];

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
      ELABORADO_POR: firmas.elaborado || { nombre: "No disponible", cargo: "No disponible" },
      REVISADO_POR: firmas.revisado || { nombre: "No disponible", cargo: "No disponible" },
      AUTORIZADO_POR: firmas.autorizado || { nombre: "No disponible", cargo: "No disponible" },
      USUARIO_VALIDADOR_ID: datosCurso.usuario_validador_id || "No disponible",

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
          }
        ]
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
          material_unidad_de_medida: m.material_unidad_de_medida || "No disponible",
          material_cantidad_10: m.material_cantidad_10 || 0,
          material_cantidad_15: m.material_cantidad_15 || 0,
          material_cantidad_20: m.material_cantidad_20 || 0,
        }));
      })(),

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
          equipamiento_descripcion: e.equipamiento_descripcion || "No disponible",
          equipamiento_unidad_de_medida: e.equipamiento_unidad_de_medida || "No disponible",
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

exports.create = async (req, res) => {
  const client = await pool.connect();
  try {
    console.log("Datos recibidos del frontend:", req.body);
    console.log("Archivo recibido:", req.file);

    const file = req.file;
    if (file && !fs.existsSync(file.path)) {
      return res
        .status(400)
        .json({ error: "El archivo no existe en la ruta especificada." });
    }

    let uploadResult;
    try {
      uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: "temarios_cursos",
        resource_type: "raw",
      });
    } catch (cloudinaryError) {
      console.error("Error al subir el archivo a Cloudinary:", cloudinaryError);
      return res
        .status(500)
        .json({ error: "Error al subir el archivo a Cloudinary" });
    } finally {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }

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
    } = req.body;

    // Función para parsear JSON si es necesario
    const parseJSON = (data) =>
      typeof data === "string" ? JSON.parse(data) : data;
    const parsedObjetivos = parseJSON(objetivos) || {};
    const parsedContenidoProgramatico = parseJSON(contenidoProgramatico) || {
      temas: [],
    };
    const parsedMateriales = parseJSON(materiales) || [];
    const parsedEquipamiento = parseJSON(equipamiento) || [];

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

    await client.query("BEGIN");

    // Array de firmas para insertar
    const firmas = [
      { nombre: revisado_por, cargo: cargo_revisado_por, tipo: "Revisado" },
      {
        nombre: autorizado_por,
        cargo: cargo_autorizado_por,
        tipo: "Autorizado",
      },
      { nombre: elaborado_por, cargo: cargo_elaborado_por, tipo: "Elaborado" },
    ];

    const firmaIds = {}; // Almacenará los IDs de las firmas insertadas

    // Insertar firmas usando un bucle for
    for (const firma of firmas) {
      const { rows } = await client.query(
        `INSERT INTO firmas (nombre, cargo, tipo_firma) VALUES ($1, $2, $3) RETURNING id`,
        [firma.nombre, firma.cargo, firma.tipo]
      );
      firmaIds[firma.tipo.toLowerCase()] = rows[0].id; // Guardar el ID en el objeto firmaIds
    }

    // Inserta curso
    const cursoQuery = `
      INSERT INTO cursos (
        nombre, clave, duracion_horas, descripcion, nivel, costo, area_id, especialidad_id, tipo_curso_id, 
        vigencia_inicio, fecha_publicacion, ultima_actualizacion, revisado_por, autorizado_por, elaborado_por, archivo_url
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) RETURNING id
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
      uploadResult.secure_url,
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
    };

    await client.query(
      `INSERT INTO ficha_tecnica 
       (id_curso, objetivo, perfil_ingreso, perfil_egreso, perfil_del_docente, metodologia,
        bibliografia, criterios_acreditacion, reconocimiento) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
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

    await client.query("COMMIT");
    res
      .status(201)
      .json({ message: "Curso registrado exitosamente", id_curso });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error al registrar el curso:", error);
    res
      .status(500)
      .json({ error: "Error al registrar el curso", details: error.message });
  } finally {
    client.release();
  }
};
exports.update = async (req, res) => {
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
        c.elaborado_por, c.revisado_por, c.autorizado_por
      FROM cursos c
      WHERE c.id = $1
    `;
    const cursoResult = await client.query(cursoQuery, [id]);

    if (cursoResult.rows.length === 0) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }

    const curso = cursoResult.rows[0];

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
    const contenidoProgramaticoResult = await client.query(contenidoProgramaticoQuery, [id]);

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

    // Organizar las firmas por tipo
    const firmas = firmasResult.rows.reduce((acc, firma) => {
      acc[firma.tipo_firma.toLowerCase()] = {
        nombre: firma.nombre || "",
        cargo: firma.cargo || "",
      };
      return acc;
    }, {});

    // Formar la respuesta con todos los detalles del curso
    const cursoDetalles = {
      ...curso,
      firmas: {
        revisado: firmas.revisado_por || { nombre: "", cargo: "" },
        autorizado: firmas.autorizado_por || { nombre: "", cargo: "" },
        elaborado: firmas.elaborado_por || { nombre: "", cargo: "" },
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
  const client = await pool.connect();
  try {
    console.log("Datos recibidos del frontend:", req.body);
    console.log("Archivo recibido:", req.file);

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
    } = req.body;

    // Función para parsear JSON si es necesario
    const parseJSON = (data) =>
      typeof data === "string" ? JSON.parse(data) : data;
    objetivos = parseJSON(objetivos) || {};
    contenidoProgramatico = parseJSON(contenidoProgramatico) || { temas: [] };
    materiales = parseJSON(materiales) || [];
    equipamiento = parseJSON(equipamiento) || [];

    await client.query("BEGIN");

    // **Obtener los IDs de las firmas actuales**
    const cursoResult = await client.query(
      "SELECT revisado_por, autorizado_por, elaborado_por FROM cursos WHERE id = $1",
      [id]
    );
    const { revisado_por: oldRevisadoPor, autorizado_por: oldAutorizadoPor, elaborado_por: oldElaboradoPor } = cursoResult.rows[0];

    // **Insertar nuevas firmas y obtener sus IDs**
    const insertFirma = async (nombre, cargo, tipo_firma) => {
      if (nombre && cargo) {
        const result = await client.query(
          "INSERT INTO firmas (nombre, cargo, tipo_firma) VALUES ($1, $2, $3) RETURNING id",
          [nombre, cargo, tipo_firma]
        );
        return result.rows[0].id;
      }
      return null;
    };

    const newRevisadoPor = await insertFirma(revisado_por, cargo_revisado_por, "revisado_por");
    const newAutorizadoPor = await insertFirma(autorizado_por, cargo_autorizado_por, "autorizado_por");
    const newElaboradoPor = await insertFirma(elaborado_por, cargo_elaborado_por, "elaborado_por");

    // **Actualizar curso con los nuevos IDs de las firmas**
    await client.query(
      `UPDATE cursos 
       SET nombre = $1, clave = $2, duracion_horas = $3, descripcion = $4, nivel = $5, costo = $6,
           area_id = $7, especialidad_id = $8, tipo_curso_id = $9, vigencia_inicio = $10, 
           fecha_publicacion = $11, ultima_actualizacion = $12, revisado_por = $13, 
           autorizado_por = $14, elaborado_por = $15 
       WHERE id = $16`,
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
        newRevisadoPor,
        newAutorizadoPor,
        newElaboradoPor,
        id,
      ]
    );

    // **Eliminar las firmas antiguas**
    if (oldRevisadoPor) {
      await client.query("DELETE FROM firmas WHERE id = $1", [oldRevisadoPor]);
    }
    if (oldAutorizadoPor) {
      await client.query("DELETE FROM firmas WHERE id = $1", [oldAutorizadoPor]);
    }
    if (oldElaboradoPor) {
      await client.query("DELETE FROM firmas WHERE id = $1", [oldElaboradoPor]);
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
    if (materiales && materiales.length > 0) {
      const materialExists = await client.query(
        "SELECT 1 FROM material WHERE id_curso = $1",
        [id]
      );

      if (materialExists.rowCount > 0) {
        console.log("Los materiales para el curso con ID", id, "ya existen.");
        await client.query("DELETE FROM material WHERE id_curso = $1", [id]);
      }

      for (const material of materiales) {
        const materialParams = {
          id_curso: id,
          descripcion: material.descripcion || "N/C",
          unidad_de_medida: material.unidad_de_medida || "N/C",
          cantidad_10: material.cantidad10 || 0,
          cantidad_15: material.cantidad15 || 0,
          cantidad_20: material.cantidad20 || 0,
        };

        const query = `
          INSERT INTO material 
          (id_curso, descripcion, unidad_de_medida, cantidad_10, cantidad_15, cantidad_20) 
          VALUES ($1, $2, $3, $4, $5, $6)
        `;

        await client.query(query, Object.values(materialParams));
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
    if (
      contenidoProgramatico &&
      contenidoProgramatico.temas &&
      contenidoProgramatico.temas.length > 0
    ) {
      const contenidoExists = await client.query(
        "SELECT 1 FROM contenido_programatico WHERE id_curso = $1",
        [id]
      );

      if (contenidoExists.rowCount > 0) {
        console.log(
          "El contenido programático para el curso con ID",
          id,
          "ya existe."
        );
        await client.query(
          "DELETE FROM contenido_programatico WHERE id_curso = $1",
          [id]
        );
      }

      for (const tema of contenidoProgramatico.temas) {
        const contenidoParams = {
          id_curso: id,
          tema_nombre: tema.tema_nombre || "N/C",
          tiempo: tema.tiempo || 0,
          competencias: tema.competencias || null,
          evaluacion: tema.evaluacion || null,
          actividades: tema.actividades || null,
        };

        const query = `
          INSERT INTO contenido_programatico 
          (id_curso, tema_nombre, tiempo, competencias, evaluacion, actividades) 
          VALUES ($1, $2, $3, $4, $5, $6)
        `;

        await client.query(query, Object.values(contenidoParams));
      }
    } else {
      console.log(
        "No se proporcionó contenido programático para el curso con ID",
        id
      );
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