const pool = require("../config/database");

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
            'curso_descripcion', c.descripcion
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
    ) AS alumnos
FROM 
    docentes d 
JOIN 
    cursos_docentes cd ON d.id = cd.docente_id
JOIN 
    cursos c ON cd.curso_id = c.id
JOIN 
    alumnos_cursos ac ON c.id = ac.curso_id
JOIN 
    alumnos a ON ac.alumno_id = a.id
WHERE 
    d.id = (
        SELECT id 
        FROM docentes 
        WHERE id_usuario = ${id_usuario}
    );



      `;
      const result = await pool.query(query);
      return result.rows; // Retorna todos los registros asociados al ID del usuario con el estatus asociado
    } catch (error) {
      console.error("Error al obtener los docentes por ID del usuario:", error);
      throw error;
    }
  },
  // async getByUserId(userId) {
  //   try {
  //     const query = `
  //       SELECT
  //         id, nombre, apellidos, email, telefono, especialidad, certificado_profesional,
  //         cedula_profesional, documento_identificacion, num_documento_identificacion,
  //         curriculum_url, estatus, created_at, updated_at, usuario_validador_id,
  //         fecha_validacion, foto_url, rol
  //       FROM docentes
  //       WHERE id_usuario = $1
  //     `;
  //     const result = await pool.query(query, [userId]);
  //     return result.rows; // Retorna todos los registros asociados al ID del usuario
  //   } catch (error) {
  //     console.error('Error al obtener los docentes por ID del usuario:', error);
  //     throw error;
  //   }
  // },

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
        d.created_at,
        d.updated_at,
        d.usuario_validador_id,
        d.fecha_validacion,
        d.foto_url,
        u.nombre AS validador_nombre,
        u.apellidos AS validador_apellidos
      FROM docentes d
      LEFT JOIN usuarios u ON d.usuario_validador_id = u.id
    `;
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
        d.estatus,
        d.created_at,
        d.updated_at,
        d.usuario_validador_id,
        d.fecha_validacion,
        d.foto_url,
        u.nombre AS validador_nombre,
        u.apellidos AS validador_apellidos
      FROM docentes d
      LEFT JOIN usuarios u ON d.usuario_validador_id = u.id
      WHERE d.id = \$1
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

  //   async update(id, docente) {
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
      await client.query("BEGIN");

      // Crear un array para almacenar las partes de la consulta y sus valores
      const updates = [];
      const values = [];
      let index = 1;

      // Agregar campos solo si están definidos
      if (docente.nombre) {
        updates.push(`nombre = $${index++}`);
        values.push(docente.nombre);
      }
      if (docente.apellidos) {
        updates.push(`apellidos = $${index++}`);
        values.push(docente.apellidos);
      }
      if (docente.email) {
        updates.push(`email = $${index++}`);
        values.push(docente.email);
      }
      if (docente.telefono !== undefined) {
        updates.push(`telefono = $${index++}`);
        values.push(docente.telefono || null);
      }
      if (docente.certificado_profesional !== undefined) {
        updates.push(`certificado_profesional = $${index++}`);
        values.push(docente.certificado_profesional);
      }
      if (docente.cedula_profesional) {
        updates.push(`cedula_profesional = $${index++}`);
        values.push(docente.cedula_profesional);
      }
      if (docente.documento_identificacion) {
        updates.push(`documento_identificacion = $${index++}`);
        values.push(docente.documento_identificacion);
      }
      if (docente.num_documento_identificacion) {
        updates.push(`num_documento_identificacion = $${index++}`);
        values.push(docente.num_documento_identificacion);
      }
      if (docente.curriculum_url) {
        updates.push(`curriculum_url = $${index++}`);
        values.push(docente.curriculum_url);
      }
      // if (docente.estatus !== undefined) {
      //   updates.push(`estatus = $${index++}`);
      //   values.push(docente.estatus);
      // }
      if (docente.usuario_validador_id) {
        updates.push(`usuario_validador_id = $${index++}`);
        values.push(docente.usuario_validador_id);
      }
      if (docente.fecha_validacion) {
        updates.push(`fecha_validacion = $${index++}`);
        values.push(docente.fecha_validacion);
      }
      if (docente.foto_url) {
        updates.push(`foto_url = $${index++}`);
        values.push(docente.foto_url);
      }

      // Verificar si hay campos para actualizar
      if (updates.length === 0) {
        throw new Error("No hay campos para actualizar");
      }

      // Construir la consulta de actualización
      const queryDocentes = `
      UPDATE docentes
      SET ${updates.join(", ")},
          updated_at = NOW()
      WHERE id = $${index}
      RETURNING *
    `;
      values.push(id);

      const { rows: docentesRows } = await client.query(queryDocentes, values);
      const docenteActualizado = docentesRows[0];

      // Actualizar la tabla `docentes_especialidades`
      if (docente.especialidades && Array.isArray(docente.especialidades)) {
        // Eliminar especialidades existentes
        const deleteEspecialidadesQuery = `
        DELETE FROM docentes_especialidades
        WHERE docente_id = $1
      `;
        await client.query(deleteEspecialidadesQuery, [id]);

        // Insertar las nuevas especialidades
        const insertEspecialidadesQuery = `
        INSERT INTO docentes_especialidades (docente_id, especialidad_id, estatus_id, created_at, updated_at)
        VALUES ($1, $2, 1, NOW(), NOW())
      `;
        for (const especialidadId of docente.especialidades) {
          await client.query(insertEspecialidadesQuery, [id, especialidadId]);
        }
      }

      await client.query("COMMIT");
      return docenteActualizado;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error al actualizar el docente:", error);
      throw error;
    } finally {
      client.release();
    }
  },
  async delete(id) {
    const query = "DELETE FROM docentes WHERE id = $1 RETURNING *";
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },
};

module.exports = DocentesModel;
