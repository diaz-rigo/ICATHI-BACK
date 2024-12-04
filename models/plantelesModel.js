const pool = require('../config/database');

const PlantelesModel = {
  async getAll() {
    const query = 'SELECT * FROM planteles';
    const { rows } = await pool.query(query);
    return rows;
  },

  async getById(id) {
    const query = 'SELECT * FROM planteles WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

  async create(plantel) {
    const query = `
      INSERT INTO planteles (
        nombre, direccion, telefono, email, director, capacidad_alumnos, 
        estatus, usuario_gestor_id, estado, municipio
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
    const values = [
      plantel.nombre,
      plantel.direccion,
      plantel.telefono || null,
      plantel.email || null,
      plantel.director,
      plantel.capacidad_alumnos,
      plantel.estatus || true,
      plantel.usuario_gestor_id || null,
      plantel.estado,
      plantel.municipio,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async update(id, plantel) {
    const query = `
      UPDATE planteles
      SET nombre = $1,
          direccion = $2,
          telefono = $3,
          email = $4,
          director = $5,
          capacidad_alumnos = $6,
          estatus = $7,
          usuario_gestor_id = $8,
          estado = $9,
          municipio = $10,
          updated_at = NOW()
      WHERE id = $11 RETURNING *`;
    const values = [
      plantel.nombre,
      plantel.direccion,
      plantel.telefono || null,
      plantel.email || null,
      plantel.director,
      plantel.capacidad_alumnos,
      plantel.estatus || true,
      plantel.usuario_gestor_id || null,
      plantel.estado,
      plantel.municipio,
      id,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async delete(id) {
    const query = 'DELETE FROM planteles WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },
};

module.exports = PlantelesModel;
