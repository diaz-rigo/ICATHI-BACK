const pool = require('../config/database');

const DocentesModel = {

  async getByUserId(userId) {
    try {
      const query = `
        SELECT 
          id, nombre, apellidos, email, telefono, especialidad, certificado_profesional,
          cedula_profesional, documento_identificacion, num_documento_identificacion,
          curriculum_url, estatus, created_at, updated_at, usuario_validador_id,
          fecha_validacion, foto_url, rol
        FROM docentes
        WHERE id_usuario = $1
      `;
      const result = await pool.query(query, [userId]);
      return result.rows; // Retorna todos los registros asociados al ID del usuario
    } catch (error) {
      console.error('Error al obtener los docentes por ID del usuario:', error);
      throw error;
    }
  },

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
      docente.foto_url || null
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async update(id, docente) {
    const query = `
      UPDATE docentes
      SET
        nombre = \$1,
        apellidos = \$2,
        email = \$3,
        telefono = \$4,
        especialidad = \$5,
        certificado_profesional = \$6,
        cedula_profesional = \$7,
        documento_identificacion = \$8,
        num_documento_identificacion = \$9,
        curriculum_url = \$10,
        estatus = \$11,
        updated_at = NOW(),
        usuario_validador_id = \$12,
        fecha_validacion = \$13,
        foto_url = \$14
      WHERE id = \$15
      RETURNING *
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
      id
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async delete(id) {
    const query = 'DELETE FROM docentes WHERE id = \$1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  }
};

module.exports = DocentesModel;