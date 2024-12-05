const pool = require('../config/database');

const EspecialidadesModel = {
  async getAll() {
    const query = 'SELECT id, nombre, area_id FROM especialidades';
    const { rows } = await pool.query(query);
    return rows;
  },
};

module.exports = EspecialidadesModel;