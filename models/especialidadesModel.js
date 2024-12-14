const pool = require('../config/database');

const EspecialidadesModel = {
  async getAll() {
    const query = 'SELECT id, nombre, area_id FROM especialidades';
    const { rows } = await pool.query(query);
    return rows;
  },


  async getEspecialidadesByAreaId(areaId) {
    const query = `
      SELECT id, nombre, descripcion
      FROM especialidades
      WHERE area_id = $1
    `;

    try {
      const { rows } = await pool.query(query, [areaId]);
      return rows;
    } catch (error) {
      console.error('Error al obtener las especialidades:', error);
      throw error;
    }
  }

};

module.exports = EspecialidadesModel;