const pool = require('../config/database');

const AreasModel = {
  async getAll() {
    const query = 'SELECT id, nombre FROM areas';
    const { rows } = await pool.query(query);
    return rows;
  },
};

module.exports = AreasModel;