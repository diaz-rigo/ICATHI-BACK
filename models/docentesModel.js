const pool = require("../config/database");
const bcrypt = require('bcrypt');
const DocentesModel = {
    async getByUserId(userId) {
        try {
            const query = `
        SELECT 
          d.id, d.nombre, d.apellidos, d.email, d.telefono, d.especialidad, 
          d.certificado_profesional, d.cedula_profesional, d.documento_identificacion, 
          d.num_documento_identificacion, d.curriculum_url, d.created_at, d.updated_at, 
          d.usuario_validador_id, d.fecha_validacion, d.foto_url, d.rol, d.estatus_id, 
          e.tipo AS estatus_tipo, e.valor AS estatus_valor
        FROM docentes d
        LEFT JOIN estatus e ON d.estatus_id = e.id
        WHERE d.id_usuario = $1
      `;
            const result = await pool.query(query, [userId]);
            return result.rows; // Retorna todos los registros asociados al ID del usuario con el estatus asociado
        } catch (error) {
            console.error("Error al obtener los docentes por ID del usuario:", error);
            throw error;
        }
    },

    async getDocenteByIdPlantel(plantelId) {
        try {
            const query = `
        SELECT 
          d.id, d.nombre, d.apellidos, d.email, d.telefono, d.especialidad, 
          d.certificado_profesional, d.cedula_profesional, d.documento_identificacion, 
          d.num_documento_identificacion, d.curriculum_url, d.created_at, d.updated_at, 
          d.usuario_validador_id, d.fecha_validacion, d.foto_url, d.rol, d.estatus_id, 
          e.tipo AS estatus_tipo, e.valor AS estatus_valor
        FROM docentes d
        LEFT JOIN estatus e ON d.estatus_id = e.id
        WHERE d.id_usuario = $1
      `;
            const result = await pool.query(query, [userId]);
            return result.rows; // Retorna todos los registros asociados al ID del usuario con el estatus asociado
        } catch (error) {
            console.error("Error al obtener los docentes por ID del usuario:", error);
            throw error;
        }
    },
    async getAlumnosCursoByIdDocente(id_usuario) {
        try {
            const query = `

      SELECT
          json_agg(
            DISTINCT jsonb_build_object(
                'curso_id', c.id,
                'curso_nombre', c.nombre,
                'curso_descripcion', c.descripcion,
                'plantel_id', pc.plantel_id,
                'plantel_nombre', p.nombre
            )
        ) AS cursos,
        json_agg(
            jsonb_build_object(
                'alumno_id', a.id,
                'alumno_nombre', a.nombre,
                'alumno_apellidos', a.apellidos,
                'alumno_email', a.email,
                'curso_id', c.id,
                'calificacion', COALESCE(ac.calificacion_final, 0)
            )
        ) FILTER (WHERE a.id IS NOT NULL) AS alumnos
      FROM
        docentes d
      JOIN
        cursos_docentes cd ON d.id = cd.docente_id
      JOIN
        cursos c ON cd.curso_id = c.id
      JOIN
        planteles_cursos pc ON c.id = pc.curso_id
      JOIN
        planteles p ON pc.plantel_id = p.id
      LEFT JOIN
        alumnos_cursos ac ON c.id = ac.curso_id
      LEFT JOIN
        alumnos a ON ac.alumno_id = a.id
      WHERE
        d.id = (
            SELECT id
            FROM docentes
            WHERE id_usuario = ${id_usuario}
        );


      `;

            // SELECT
            //     json_agg(
            //       DISTINCT jsonb_build_object(
            //           'curso_id', c.id,
            //           'curso_nombre', c.nombre,
            //           'curso_descripcion', c.descripcion,
            //           'plantel_id', pc.plantel_id,
            //           'plantel_nombre', p.nombre
            //       )
            //   ) AS cursos,
            //   json_agg(
            //       jsonb_build_object(
            //           'alumno_id', a.id,
            //           'alumno_nombre', a.nombre,
            //           'alumno_apellidos', a.apellidos,
            //           'alumno_email', a.email,
            //           'curso_id', c.id,
            //           'calificacion', COALESCE(ac.calificacion_final, 0)
            //       )
            //   ) FILTER (WHERE a.id IS NOT NULL) AS alumnos
            // FROM
            //   docentes d
            // JOIN
            //   cursos_docentes cd ON d.id = cd.docente_id
            // JOIN
            //   cursos c ON cd.curso_id = c.id
            // JOIN
            //   planteles_cursos pc ON c.id = pc.curso_id
            // JOIN
            //   planteles p ON pc.plantel_id = p.id
            // LEFT JOIN
            //   alumnos_cursos ac ON c.id = ac.curso_id
            // LEFT JOIN
            //   alumnos a ON ac.alumno_id = a.id
            // WHERE
            //   d.id = (
            //       SELECT id
            //       FROM docentes
            //       WHERE id_usuario = ${id_usuario}
            //   );
            const result = await pool.query(query);
            return result.rows; // Retorna todos los registros asociados al ID del usuario con el estatus asociado
        } catch (error) {
            console.error("Error al obtener los docentes por ID del usuario:", error);
            throw error;
        }
    },


    async updateStatus(docenteId, nuevoEstatusId, usuarioValidadorId) {
        try {
            // Consulta SQL para actualizar el estatus de un docente
            const query = `
      UPDATE docentes
      SET 
        estatus_id = $1, 
        updated_at = NOW(), 
        usuario_validador_id = $2, 
        fecha_validacion = NOW()
      WHERE id = $3
      RETURNING *; -- Devuelve el registro actualizado
    `;

            // Ejecutamos la consulta con los valores proporcionados
            const result = await pool.query(query, [nuevoEstatusId, usuarioValidadorId, docenteId]);

            // Verifica si se actualizó algún registro
            if (result.rowCount === 0) {
                return null; // Retornar null si no se encuentra el docente
            }

            return result.rows[0]; // Retorna el registro actualizado
        } catch (error) {
            // Manejo de errores
            console.error('Error al actualizar el estatus del docente:', error);
            throw error;
        }
    }

    ,

    async getAll() {
        const query = `
    SELECT 
        d.id,
        d.nombre,
        d.apellidos,
        d.email,
        d.telefono,
        d.especialidad,
        d.certificado_profesional,
        d.cedula_profesional,
        d.documento_identificacion,
        d.num_documento_identificacion,
        d.curriculum_url,
        d.estatus_id,
        e.tipo AS estatus_tipo,
        e.valor AS estatus_valor,
        d.created_at,
        d.updated_at,
        d.usuario_validador_id,
        d.fecha_validacion,
        d.foto_url,
        u.nombre AS validador_nombre,
        u.apellidos AS validador_apellidos
    FROM docentes d
    LEFT JOIN usuarios u ON d.usuario_validador_id = u.id
    LEFT JOIN estatus e ON d.estatus_id = e.id
`
        const { rows } = await pool.query(query);
        return rows;
    },

    async getById(id) {
        const query = `
    SELECT 
      d.id,
      d.nombre,
      d.apellidos,
      d.email,
      d.telefono,
      d.especialidad,
      d.certificado_profesional,
      d.cedula_profesional,
      d.documento_identificacion,
      d.num_documento_identificacion,
      d.curriculum_url,
      e.tipo AS estatus_tipo,
      e.valor AS estatus_valor,
      d.created_at,
      d.updated_at,
      d.usuario_validador_id,
      d.fecha_validacion,
      d.foto_url,
      u.nombre AS validador_nombre,
      u.apellidos AS validador_apellidos
    FROM docentes d
    LEFT JOIN usuarios u ON d.usuario_validador_id = u.id
    LEFT JOIN estatus e ON d.estatus_id = e.id
    WHERE d.id = $1
  `;

        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    async create(docente) {
        const query = `
      INSERT INTO docentes (
        nombre,
        apellidos,
        email,
        telefono,
        especialidad,
        certificado_profesional,
        cedula_profesional,
        documento_identificacion,
        num_documento_identificacion,
        curriculum_url,
        estatus,
        usuario_validador_id,
        fecha_validacion,
        foto_url
      ) VALUES (
        \$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8, \$9, \$10,
        \$11, \$12, \$13, \$14
      ) RETURNING *
    `;
        const values = [
            docente.nombre,
            docente.apellidos,
            docente.email,
            docente.telefono || null,
            docente.especialidad || null,
            docente.certificado_profesional || false,
            docente.cedula_profesional || null,
            docente.documento_identificacion || null,
            docente.num_documento_identificacion || null,
            docente.curriculum_url || null,
            docente.estatus !== undefined ? docente.estatus : true,
            docente.usuario_validador_id || null,
            docente.fecha_validacion || null,
            docente.foto_url || null,
        ];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    //     const client = await pool.connect();
    //     try {
    //       await client.query('BEGIN');

    //       // Actualizar la tabla `docentes`
    //       const queryDocentes = `
    //         UPDATE docentes
    //         SET
    //           nombre = $1,
    //           apellidos = $2,
    //           email = $3,
    //           telefono = $4,
    //           certificado_profesional = $5,
    //           cedula_profesional = $6,
    //           documento_identificacion = $7,
    //           num_documento_identificacion = $8,
    //           curriculum_url = $9,
    //           estatus = $10,
    //           updated_at = NOW(),
    //           usuario_validador_id = $11,
    //           fecha_validacion = $12,
    //           foto_url = $13
    //         WHERE id = $14
    //         RETURNING *
    //       `;
    //       const valuesDocentes = [
    //         docente.nombre,
    //         docente.apellidos,
    //         docente.email,
    //         docente.telefono || null,
    //         docente.certificado_profesional || false,
    //         docente.cedula_profesional || null,
    //         docente.documento_identificacion || null,
    //         docente.num_documento_identificacion || null,
    //         docente.curriculum_url || null,
    //         docente.estatus !== undefined ? docente.estatus : true,
    //         docente.usuario_validador_id || null,
    //         docente.fecha_validacion || null,
    //         docente.foto_url || null,
    //         id
    //       ];

    //       const { rows: docentesRows } = await client.query(queryDocentes, valuesDocentes);
    //       const docenteActualizado = docentesRows[0];

    //       // Actualizar la tabla `docentes_especialidades`
    //       if (docente.especialidades && Array.isArray(docente.especialidades)) {
    //         // Eliminar especialidades existentes
    //         const deleteEspecialidadesQuery = `
    //           DELETE FROM docentes_especialidades
    //           WHERE docente_id = $1
    //         `;
    //         await client.query(deleteEspecialidadesQuery, [id]);

    //         // Insertar las nuevas especialidades
    //         const insertEspecialidadesQuery = `
    //           INSERT INTO docentes_especialidades (docente_id, especialidad_id, estatus_id, created_at, updated_at)
    //           VALUES ($1, $2, 1, NOW(), NOW())
    //         `;
    //         for (const especialidadId of docente.especialidades) {
    //           await client.query(insertEspecialidadesQuery, [id, especialidadId]);
    //         }
    //       }

    //       await client.query('COMMIT');
    //       return docenteActualizado;
    //     } catch (error) {
    //       await client.query('ROLLBACK');
    //       console.error('Error al actualizar el docente:', error);
    //       throw error;
    //     } finally {
    //       client.release();
    //     }
    //   }
    // ,
    async update(id, docente) {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const hasKey = (k) => Object.prototype.hasOwnProperty.call(docente, k);
            const nn = (v) => (v === '' ? null : v);

            // 1) Traer el docente actual para conocer id_usuario y valores previos
            const { rows: currentRows } = await client.query(
                `SELECT id, id_usuario, email AS email_docente, telefono AS tel_docente
       FROM docentes
       WHERE id = $1
       FOR UPDATE`, // bloquea fila
                [id]
            );
            if (currentRows.length === 0) {
                throw new Error('Docente no encontrado');
            }
            const { id_usuario } = currentRows[0];

            // 2) Validaciones de unicidad si se pretenden actualizar
            // 2.1 Correo
            if (hasKey('email') && nn(docente.email)) {
                const newEmail = nn(docente.email);
                // Busca el email igual (case-insensitive) en usuarios y docentes, excluyendo los actuales
                const { rows: emailConflicts } = await client.query(
                    `
        SELECT 'usuarios' AS tabla FROM usuarios
        WHERE LOWER(email) = LOWER($1) AND id <> COALESCE($2, -1)
        UNION ALL
        SELECT 'docentes' AS tabla FROM docentes
        WHERE LOWER(email) = LOWER($1) AND id <> $3
        LIMIT 1
        `, [newEmail, id_usuario, id]
                );
                if (emailConflicts.length > 0) {
                    throw new Error(`El correo "${newEmail}" ya está registrado en ${emailConflicts[0].tabla}.`);
                }
            }

            // 2.2 Teléfono
            if (hasKey('telefono') && nn(docente.telefono)) {
                const newTel = nn(docente.telefono);
                const { rows: telConflicts } = await client.query(
                    `
        SELECT 'usuarios' AS tabla FROM usuarios
        WHERE telefono = $1 AND id <> COALESCE($2, -1)
        UNION ALL
        SELECT 'docentes' AS tabla FROM docentes
        WHERE telefono = $1 AND id <> $3
        LIMIT 1
        `, [newTel, id_usuario, id]
                );
                if (telConflicts.length > 0) {
                    throw new Error(`El teléfono "${newTel}" ya está registrado en ${telConflicts[0].tabla}.`);
                }
            }

            // 3) Construir UPDATE de DOCENTES
            const updates = [];
            const values = [];
            let idx = 1;

            if (hasKey('nombre')) {
                updates.push(`nombre = $${idx++}`);
                values.push(nn(docente.nombre));
            }
            if (hasKey('apellidos')) {
                updates.push(`apellidos = $${idx++}`);
                values.push(nn(docente.apellidos));
            }
            if (hasKey('email')) {
                updates.push(`email = $${idx++}`);
                values.push(nn(docente.email));
            }
            if (hasKey('telefono')) {
                updates.push(`telefono = $${idx++}`);
                values.push(nn(docente.telefono));
            }

            if (docente.certificado_profesional !== undefined) {
                updates.push(`certificado_profesional = $${idx++}`);
                values.push(!!docente.certificado_profesional);
            }

            if (hasKey('cedula_profesional')) {
                updates.push(`cedula_profesional = $${idx++}`);
                values.push(nn(docente.cedula_profesional));
            }
            if (hasKey('documento_identificacion')) {
                updates.push(`documento_identificacion = $${idx++}`);
                values.push(nn(docente.documento_identificacion));
            }
            if (hasKey('num_documento_identificacion')) {
                updates.push(`num_documento_identificacion = $${idx++}`);
                values.push(nn(docente.num_documento_identificacion));
            }
            if (hasKey('curriculum_url')) {
                updates.push(`curriculum_url = $${idx++}`);
                values.push(nn(docente.curriculum_url));
            }
            if (hasKey('foto_url')) {
                updates.push(`foto_url = $${idx++}`);
                values.push(nn(docente.foto_url));
            }

            if (hasKey('usuario_validador_id')) {
                updates.push(`usuario_validador_id = $${idx++}`);
                values.push(docente.usuario_validador_id);
            }
            if (hasKey('fecha_validacion')) {
                updates.push(`fecha_validacion = $${idx++}`);
                values.push(docente.fecha_validacion);
            }

            if (updates.length === 0 && !Array.isArray(docente.especialidades)) {
                throw new Error('No hay campos para actualizar');
            }

            let docenteActualizado = null;
            if (updates.length > 0) {
                const qDoc =
                    `UPDATE docentes
         SET ${updates.join(', ')}, updated_at = NOW()
         WHERE id = $${idx}
         RETURNING *`;
                values.push(id);
                const { rows } = await client.query(qDoc, values);
                docenteActualizado = rows[0];
            } else {
                // Si sólo se actualizan especialidades, trae el docente sin cambiar campos
                const { rows } = await client.query(`SELECT * FROM docentes WHERE id = $1`, [id]);
                docenteActualizado = rows[0];
            }

            // 4) Sincronizar con USUARIOS (si existe id_usuario)
            if (id_usuario) {
                const uUpdates = [];
                const uValues = [];
                let uidx = 1;

                if (hasKey('nombre')) {
                    uUpdates.push(`nombre = $${uidx++}`);
                    uValues.push(nn(docente.nombre));
                }
                if (hasKey('apellidos')) {
                    uUpdates.push(`apellidos = $${uidx++}`);
                    uValues.push(nn(docente.apellidos));
                }

                if (hasKey('email')) {
                    uUpdates.push(`email = $${uidx++}`);
                    uValues.push(nn(docente.email));
                    // si cambia email, invalidar validación de correo
                    uUpdates.push(`correo_validado = false`);
                }

                if (hasKey('telefono')) {
                    uUpdates.push(`telefono = $${uidx++}`);
                    uValues.push(nn(docente.telefono));
                }

                if (uUpdates.length > 0) {
                    const qUser =
                        `UPDATE usuarios
           SET ${uUpdates.join(', ')}, updated_at = NOW()
           WHERE id = $${uidx}
           RETURNING *`;
                    uValues.push(id_usuario);
                    await client.query(qUser, uValues);
                }
            }

            // 5) Especialidades (reemplazo completo si vienen)
            if (Array.isArray(docente.especialidades)) {
                await client.query(`DELETE FROM docentes_especialidades WHERE docente_id = $1`, [id]);
                if (docente.especialidades.length > 0) {
                    const insertEsp =
                        `INSERT INTO docentes_especialidades (docente_id, especialidad_id, estatus_id, created_at, updated_at)
           VALUES ($1, $2, 1, NOW(), NOW())`;
                    for (const especialidadId of docente.especialidades) {
                        await client.query(insertEsp, [id, especialidadId]);
                    }
                }
            }

            await client.query('COMMIT');
            return docenteActualizado;
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Error al actualizar el docente:', err);
            // Opcional: mapear a 409 si es conflicto de unicidad
            throw err;
        } finally {
            client.release();
        }
    },
    // async update(id, docente) {
    //     const client = await pool.connect();
    //     try {
    //         await client.query("BEGIN");

    //         const updates = [];
    //         const values = [];
    //         let index = 1;

    //         // Utilidad: checar si la clave viene en el payload (aunque sea null)
    //         const hasKey = (k) => Object.prototype.hasOwnProperty.call(docente, k);
    //         // Normaliza: '' -> null (defensa en profundidad por si el controlador no lo hizo)
    //         const nn = (v) => (v === '' ? null : v);

    //         // Campos string "normales"
    //         if (hasKey('nombre')) {
    //             updates.push(`nombre = $${index++}`);
    //             values.push(nn(docente.nombre));
    //         }
    //         if (hasKey('apellidos')) {
    //             updates.push(`apellidos = $${index++}`);
    //             values.push(nn(docente.apellidos));
    //         }
    //         if (hasKey('email')) {
    //             updates.push(`email = $${index++}`);
    //             values.push(nn(docente.email));
    //         }

    //         // Telefono: ya contemplabas null
    //         if (hasKey('telefono')) {
    //             updates.push(`telefono = $${index++}`);
    //             values.push(docente.telefono || null);
    //         }

    //         // Booleanos deben usar !== undefined
    //         if (docente.certificado_profesional !== undefined) {
    //             updates.push(`certificado_profesional = $${index++}`);
    //             values.push(docente.certificado_profesional);
    //         }

    //         // ⚠️ Campos de ARCHIVO: permitir null explícito o '' -> null
    //         if (hasKey('cedula_profesional')) {
    //             updates.push(`cedula_profesional = $${index++}`);
    //             values.push(nn(docente.cedula_profesional)); // puede ser URL o null
    //         }
    //         if (hasKey('documento_identificacion')) {
    //             updates.push(`documento_identificacion = $${index++}`);
    //             values.push(nn(docente.documento_identificacion)); // puede ser URL o null
    //         }
    //         if (hasKey('num_documento_identificacion')) {
    //             updates.push(`num_documento_identificacion = $${index++}`);
    //             values.push(nn(docente.num_documento_identificacion)); // string o null
    //         }
    //         if (hasKey('curriculum_url')) {
    //             updates.push(`curriculum_url = $${index++}`);
    //             values.push(nn(docente.curriculum_url)); // URL o null
    //         }
    //         if (hasKey('foto_url')) {
    //             updates.push(`foto_url = $${index++}`);
    //             values.push(nn(docente.foto_url)); // URL o null
    //         }

    //         // Otros metadatos
    //         if (hasKey('usuario_validador_id')) {
    //             updates.push(`usuario_validador_id = $${index++}`);
    //             values.push(docente.usuario_validador_id);
    //         }
    //         if (hasKey('fecha_validacion')) {
    //             updates.push(`fecha_validacion = $${index++}`);
    //             values.push(docente.fecha_validacion);
    //         }

    //         if (updates.length === 0) {
    //             throw new Error("No hay campos para actualizar");
    //         }

    //         const queryDocentes = `
    //   UPDATE docentes
    //   SET ${updates.join(", ")},
    //       updated_at = NOW()
    //   WHERE id = $${index}
    //   RETURNING *
    // `;
    //         values.push(id);

    //         const { rows: docentesRows } = await client.query(queryDocentes, values);
    //         const docenteActualizado = docentesRows[0];

    //         // Especialidades (si vienen)
    //         if (Array.isArray(docente.especialidades)) {
    //             await client.query(`DELETE FROM docentes_especialidades WHERE docente_id = $1`, [id]);
    //             const insertEspecialidadesQuery = `
    //     INSERT INTO docentes_especialidades (docente_id, especialidad_id, estatus_id, created_at, updated_at)
    //     VALUES ($1, $2, 1, NOW(), NOW())
    //   `;
    //             for (const especialidadId of docente.especialidades) {
    //                 await client.query(insertEspecialidadesQuery, [id, especialidadId]);
    //             }
    //         }

    //         await client.query("COMMIT");
    //         return docenteActualizado;
    //     } catch (error) {
    //         await client.query("ROLLBACK");
    //         console.error("Error al actualizar el docente:", error);
    //         throw error;
    //     } finally {
    //         client.release();
    //     }
    // },
    // async update(id, docente) {
    //     const client = await pool.connect();
    //     try {
    //         await client.query("BEGIN");

    //         // Crear un array para almacenar las partes de la consulta y sus valores
    //         const updates = [];
    //         const values = [];
    //         let index = 1;

    //         // Agregar campos solo si están definidos
    //         if (docente.nombre) {
    //             updates.push(`nombre = $${index++}`);
    //             values.push(docente.nombre);
    //         }
    //         if (docente.apellidos) {
    //             updates.push(`apellidos = $${index++}`);
    //             values.push(docente.apellidos);
    //         }
    //         if (docente.email) {
    //             updates.push(`email = $${index++}`);
    //             values.push(docente.email);
    //         }
    //         if (docente.telefono !== undefined) {
    //             updates.push(`telefono = $${index++}`);
    //             values.push(docente.telefono || null);
    //         }

    //         if (docente.certificado_profesional !== undefined) {
    //             updates.push(`certificado_profesional = $${index++}`);
    //             values.push(docente.certificado_profesional);
    //         }
    //         // ARCHIVOS URL
    //         if (hasKey('cedula_profesional')) {
    //             updates.push(`cedula_profesional = $${index++}`);
    //             values.push(nn(docente.cedula_profesional)); // puede ser URL o null
    //         }
    //         if (hasKey('documento_identificacion')) {
    //             updates.push(`documento_identificacion = $${index++}`);
    //             values.push(nn(docente.documento_identificacion)); // puede ser URL o null
    //         }
    //         if (hasKey('num_documento_identificacion')) {
    //             updates.push(`num_documento_identificacion = $${index++}`);
    //             values.push(nn(docente.num_documento_identificacion)); // string o null
    //         }
    //         if (hasKey('curriculum_url')) {
    //             updates.push(`curriculum_url = $${index++}`);
    //             values.push(nn(docente.curriculum_url)); // URL o null
    //         }
    //         if (docente.cedula_profesional) {
    //             updates.push(`cedula_profesional = $${index++}`);
    //             values.push(docente.cedula_profesional);
    //         }
    //         if (docente.documento_identificacion) {
    //             updates.push(`documento_identificacion = $${index++}`);
    //             values.push(docente.documento_identificacion);
    //         }
    //         if (docente.num_documento_identificacion) {
    //             updates.push(`num_documento_identificacion = $${index++}`);
    //             values.push(docente.num_documento_identificacion);
    //         }
    //         if (docente.curriculum_url) {
    //             updates.push(`curriculum_url = $${index++}`);
    //             values.push(docente.curriculum_url);
    //         }
    //         // if (docente.estatus !== undefined) {
    //         //   updates.push(`estatus = $${index++}`);
    //         //   values.push(docente.estatus);
    //         // }
    //         if (docente.usuario_validador_id) {
    //             updates.push(`usuario_validador_id = $${index++}`);
    //             values.push(docente.usuario_validador_id);
    //         }
    //         if (docente.fecha_validacion) {
    //             updates.push(`fecha_validacion = $${index++}`);
    //             values.push(docente.fecha_validacion);
    //         }
    //         if (docente.foto_url) {
    //             updates.push(`foto_url = $${index++}`);
    //             values.push(docente.foto_url);
    //         }

    //         // Verificar si hay campos para actualizar
    //         if (updates.length === 0) {
    //             throw new Error("No hay campos para actualizar");
    //         }

    //         // Construir la consulta de actualización
    //         const queryDocentes = `
    //   UPDATE docentes
    //   SET ${updates.join(", ")},
    //       updated_at = NOW()
    //   WHERE id = $${index}
    //   RETURNING *
    // `;
    //         values.push(id);

    //         const { rows: docentesRows } = await client.query(queryDocentes, values);
    //         const docenteActualizado = docentesRows[0];

    //         // Actualizar la tabla `docentes_especialidades`
    //         if (docente.especialidades && Array.isArray(docente.especialidades)) {
    //             // Eliminar especialidades existentes
    //             const deleteEspecialidadesQuery = `
    //     DELETE FROM docentes_especialidades
    //     WHERE docente_id = $1
    //   `;
    //             await client.query(deleteEspecialidadesQuery, [id]);

    //             // Insertar las nuevas especialidades
    //             const insertEspecialidadesQuery = `
    //     INSERT INTO docentes_especialidades (docente_id, especialidad_id, estatus_id, created_at, updated_at)
    //     VALUES ($1, $2, 1, NOW(), NOW())
    //   `;
    //             for (const especialidadId of docente.especialidades) {
    //                 await client.query(insertEspecialidadesQuery, [id, especialidadId]);
    //             }
    //         }

    //         await client.query("COMMIT");
    //         return docenteActualizado;
    //     } catch (error) {
    //         await client.query("ROLLBACK");
    //         console.error("Error al actualizar el docente:", error);
    //         throw error;
    //     } finally {
    //         client.release();
    //     }
    // },
    async delete(id) {
        const query = "DELETE FROM docentes WHERE id = $1 RETURNING *";
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },


    getUserById: async(userId) => {
        const query = `
            SELECT id, password_hash
            FROM usuarios
            WHERE id = $1 AND estatus = true
            LIMIT 1;
        `;
        const result = await pool.query(query, [userId]);
        return result.rows[0];
    },

    // Actualizar contraseña
    updatePassword: async(userId, newHash) => {
        const query = `
            UPDATE usuarios
            SET password_hash = $1, updated_at = now()
            WHERE id = $2
            RETURNING id;
        `;
        const result = await pool.query(query, [newHash, userId]);
        return result.rows[0];
    },

    // Registrar log de acción
    logAction: async(userId, accion, detalle, ip, userAgent) => {
        const query = `
            INSERT INTO acciones_log (usuario_id, accion, detalle, ip, user_agent)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id;
        `;
        const result = await pool.query(query, [userId, accion, detalle, ip, userAgent]);
        return result.rows[0];
    },

    // Verificar si la contraseña coincide
    verifyPassword: async(plainPassword, hashedPassword) => {
        return await bcrypt.compare(plainPassword, hashedPassword || '');
    },

    // Hashear nueva contraseña
    hashPassword: async(password) => {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    },

    // Validar política de contraseña
    validatePasswordPolicy: (password) => {
        const policy = {
            minLen: 8,
            upper: /[A-Z]/,
            lower: /[a-z]/,
            digit: /[0-9]/,
            special: /[^A-Za-z0-9]/,
        };

        return {
            isValid: (
                password.length >= policy.minLen &&
                policy.upper.test(password) &&
                policy.lower.test(password) &&
                policy.digit.test(password) &&
                policy.special.test(password)
            ),
            requirements: {
                minLength: policy.minLen,
                hasUpperCase: policy.upper.test(password),
                hasLowerCase: policy.lower.test(password),
                hasDigit: policy.digit.test(password),
                hasSpecialChar: policy.special.test(password)
            }
        };
    }


};

module.exports = DocentesModel;