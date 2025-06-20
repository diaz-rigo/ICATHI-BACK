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