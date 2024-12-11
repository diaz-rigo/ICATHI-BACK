const pool = require("../config/database"); // Importa la configuración del pool de conexiones

const Docente = {
  // Crear un nuevo docente
  async crearDocente(data) {
    const {
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
      foto_url,
      id_usuario,
    } = data;

    const query = `
      INSERT INTO docentes (
        nombre, apellidos, email, telefono, especialidad,
        certificado_profesional, cedula_profesional, documento_identificacion,
        num_documento_identificacion, curriculum_url, estatus,
        usuario_validador_id, foto_url, id_usuario
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      )
      RETURNING *;
    `;
    const values = [
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
      foto_url,
      id_usuario,
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0]; // Retorna el docente creado
    } catch (error) {
      console.error("Error al crear docente:", error.message);
      throw error;
    }
  },

  // Listar todos los docentes
  async listarDocentes() {
    const query = `SELECT * FROM docentes;`;

    try {
      const result = await pool.query(query);
      return result.rows; // Retorna la lista de docentes
    } catch (error) {
      console.error("Error al listar docentes:", error.message);
      throw error;
    }
  },

  // Obtener un docente por ID
  async obtenerDocentePorId(id) {
    const query = `SELECT * FROM docentes WHERE id = $1;`;
    const values = [id];

    try {
      const result = await pool.query(query, values);
      return result.rows[0]; // Retorna el docente encontrado
    } catch (error) {
      console.error("Error al obtener docente por ID:", error.message);
      throw error;
    }
  },

  // Actualizar docente
  async actualizarDocente(id, data) {
    const {
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
      foto_url,
    } = data;

    const query = `
      UPDATE docentes
      SET nombre = $1, apellidos = $2, email = $3, telefono = $4, especialidad = $5,
          certificado_profesional = $6, cedula_profesional = $7, documento_identificacion = $8,
          num_documento_identificacion = $9, curriculum_url = $10, estatus = $11,
          usuario_validador_id = $12, foto_url = $13, updated_at = now()
      WHERE id = $14
      RETURNING *;
    `;
    const values = [
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
      foto_url,
      id,
    ];

    try {
      const result = await pool.query(query, values);
      return result.rows[0]; // Retorna el docente actualizado
    } catch (error) {
      console.error("Error al actualizar docente:", error.message);
      throw error;
    }
  },

  // Eliminar docente
  async eliminarDocente(id) {
    const query = `
      DELETE FROM docentes
      WHERE id = $1
      RETURNING *;
    `;
    const values = [id];

    try {
      const result = await pool.query(query, values);
      return result.rows[0]; // Retorna el docente eliminado
    } catch (error) {
      console.error("Error al eliminar docente:", error.message);
      throw error;
    }
  },
};

module.exports = Docente;
