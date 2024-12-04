const pool = require('../config/database');

const CursosModel = {
  async getCursoDetailsById(id) {
    const query = `
      SELECT 
          c.id AS curso_id,
          c.nombre AS nombre_curso,
          c.descripcion AS descripcion_curso,
          dp.presentacion,
          dp.objetivo_especialidad,
          dp.objetivo_curso,
          dp.perfil_ingreso,
          dp.perfil_egreso,
          dp.publicacion_laboral,
          (SELECT STRING_AGG(m.nombre_material || ' (' || m.cantidad || ')', ', ') 
           FROM materiales m WHERE m.curso_id = c.id) AS materiales,
          (SELECT STRING_AGG(t.nombre_tema, ', ') 
           FROM temarios t WHERE t.curso_id = c.id) AS temas,
          (SELECT CONCAT(dpo.elaborado_por, ', ', dpo.revisado_por, ', ', dpo.autorizado_por) 
           FROM datos_portada dpo WHERE dpo.curso_id = c.id) AS responsables
      FROM cursos c
      JOIN datos_pdf dp ON dp.curso_id = c.id
      WHERE c.id = $1
      LIMIT 100;
    `;
    const { rows } = await pool.query(query, [id]);
    return rows[0]; // Devuelve solo el primer resultado
  },

  async getAll() {
    const query = 'SELECT * FROM cursos';
    const { rows } = await pool.query(query);
    return rows;
  },

  async getById(id) {
    const query = 'SELECT * FROM cursos WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

  async create(curso) {
    const query = `
      INSERT INTO cursos (nombre, descripcion, duracion_horas, nivel, costo, requisitos, estatus, usuario_validador_id, fecha_validacion)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`;
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
      SET nombre = $1,
          descripcion = $2,
          duracion_horas = $3,
          nivel = $4,
          costo = $5,
          requisitos = $6,
          estatus = $7,
          usuario_validador_id = $8,
          fecha_validacion = $9,
          updated_at = NOW()
      WHERE id = $10 RETURNING *`;
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
      id,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async delete(id) {
    const query = 'DELETE FROM cursos WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },
};

module.exports = CursosModel;
