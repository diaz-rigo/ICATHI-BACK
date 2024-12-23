const pool = require("../config/database");

const AreasModel = {
  async getAll() {
    const query = "SELECT id, nombre FROM areas";
    const { rows } = await pool.query(query);
    return rows;
  },
  async getAllByIdPlantel(idPlantel) {
    const query = `SELECT DISTINCT a.id AS area_id, 
                a.nombre AS area_nombre, 
                a.descripcion AS area_descripcion
FROM areas a
INNER JOIN cursos c ON a.id = c.area_id
INNER JOIN planteles_cursos pc ON c.id = pc.curso_id
WHERE pc.plantel_id = ${idPlantel}  AND pc.estatus = true;
`;
    const { rows } = await pool.query(query);
    return rows;
  },
};

module.exports = AreasModel;
