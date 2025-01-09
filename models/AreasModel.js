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
  async getAllInfoById(idArea) {
    const query = `SELECT
  a.id AS area_id,
  a.nombre AS area_nombre,
  a.descripcion AS area_descripcion,
  (SELECT COUNT(*) FROM especialidades e WHERE e.area_id = a.id) AS num_especialidades,
  (SELECT COUNT(*) FROM cursos c WHERE c.area_id = a.id) AS num_cursos_area,
  (SELECT COUNT(*) FROM cursos c WHERE c.area_id = a.id AND c.especialidad_id IN (
    SELECT id FROM especialidades WHERE area_id = a.id
  )) AS num_cursos_area_especialidad,
  (SELECT json_agg(json_build_object(
    'id', e.id,
    'nombre', e.nombre,
    'descripcion', e.descripcion
  ))
  FROM especialidades e
  WHERE e.area_id = a.id) AS especialidades,
  (SELECT json_agg(json_build_object(
    'id', c.id,
    'nombre', c.nombre,
    'descripcion', c.descripcion,
    'duracion_horas', c.duracion_horas,
    'nivel', c.nivel,
    'costo', c.costo,
    'requisitos', c.requisitos,
    'estatus', c.estatus,
    'modalidad', c.modalidad,
    'clave', c.clave,
    'vigencia_inicio', c.vigencia_inicio,
    'fecha_publicacion', c.fecha_publicacion,
    'ultima_actualizacion', c.ultima_actualizacion
  ))
  FROM cursos c
  WHERE c.area_id = a.id) AS cursos
FROM areas a
WHERE a.id = ${idArea}; -- Reemplaza con el ID del área que deseas consultar
`;
    const { rows } = await pool.query(query);
    return rows;
  },
};

module.exports = AreasModel;
