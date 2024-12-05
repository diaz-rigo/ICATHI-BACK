const pool = require('../config/database');

const TiposCursoModel = {
  async getAll() {
    const query = 'SELECT id, nombre FROM tipos_curso';
    const { rows } = await pool.query(query);
    return rows;
  },
};

module.exports = TiposCursoModel;