const pool = require('../config/database');

const CursosModel = {
  async getAll() {
    const query = `
      SELECT 
        id, 
        nombre, 
        descripcion, 
        duracion_horas,
        nivel -- Incluimos el campo nivel aquí
      FROM cursos
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  async getById(id) {
    const query = 'SELECT * FROM cursos WHERE id = \$1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

  async create(curso) {
    const query = `
      INSERT INTO cursos (nombre, descripcion, duracion_horas, nivel, costo, requisitos, estatus, usuario_validador_id, fecha_validacion)
      VALUES (\$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8, \$9) RETURNING *`;
    const values = [
      curso.nombre,
      curso.descripcion,
      curso.duracion_horas,
      curso.nivel,
      curso.costo || 0,
      curso.requisitos || null,
      curso.estatus || true,
      curso.usuario_validador_id || null,
      curso.fecha_validacion || null,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async update(id, curso) {
    const query = `
      UPDATE cursos
      SET nombre = \$1,
          descripcion = \$2,
          duracion_horas = \$3,
          nivel = \$4,
          costo = \$5,
          requisitos = \$6,
          estatus = \$7,
          usuario_validador_id = \$8,
          fecha_validacion = \$9,
          updated_at = NOW()
      WHERE id = \$10 RETURNING *`;
    const values = [
      curso.nombre,
      curso.descripcion,
      curso.duracion_horas,
      curso.nivel, // Asegúrate de que este campo esté presente
      curso.costo || 0,
      curso.requisitos || null,
      curso.estatus || true,
      curso.usuario_validador_id || null,
      curso.fecha_validacion || null,
      id,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async delete(id) {
    const query = 'DELETE FROM cursos WHERE id = \$1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },
};

module.exports = CursosModel;