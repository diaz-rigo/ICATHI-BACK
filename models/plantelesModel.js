const bcrypt = require('bcrypt');
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
    const saltRounds = 10;

    // Generar hash de la contraseña si se proporciona
    const hashedPassword = plantel.password
      ? await bcrypt.hash(plantel.password, saltRounds)
      : null;

    const query = `
      INSERT INTO planteles (
        nombre, direccion, telefono, email, director, capacidad_alumnos, 
        estatus, usuario_gestor_id, estado, municipio, password
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`;
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
      hashedPassword, // Aquí pasa el hash directamente como contraseña
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async update(id, plantel) {
    const saltRounds = 10;

    // Generar hash de la nueva contraseña si se proporciona
    const hashedPassword = plantel.password
      ? await bcrypt.hash(plantel.password, saltRounds)
      : null;

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
          password = COALESCE($11, password),
          updated_at = NOW()
      WHERE id = $12 RETURNING *`;
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
      hashedPassword, // Aquí también pasa el hash directamente
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


  async getPlantelDetails(plantelId) {
    const query = `
      SELECT 
          p.id AS plantel_id,
          COUNT(DISTINCT ac.curso_id) AS total_cursos,
          COUNT(DISTINCT ac.alumno_id) AS total_alumnos
      FROM 
          planteles_cursos pc
      LEFT JOIN 
          alumnos_cursos ac ON pc.plantel_id = ac.plantel_id AND pc.curso_id = ac.curso_id
      JOIN 
          planteles p ON p.id = pc.plantel_id
      WHERE 
          p.id = $1
      GROUP BY 
          p.id;
    `;
    const { rows } = await pool.query(query, [plantelId]);
    return rows[0]; // Retornar un solo registro, ya que es específico para un plantel.
  },
  async getCursosByPlantelId(plantelId) {
    const query = `
      SELECT 
          c.id AS curso_id,
          c.nombre AS curso_nombre,
          c.descripcion AS curso_descripcion,
          c.duracion_horas,
          c.nivel,
          c.costo,
          c.requisitos,
          pc.cupo_maximo,
          pc.fecha_inicio,
          pc.fecha_fin,
          pc.horario,
          pc.estatus
      FROM 
          planteles_cursos pc
      JOIN 
          cursos c ON pc.curso_id = c.id
      WHERE 
          pc.plantel_id = $1;
    `;
    const values = [plantelId];
    const { rows } = await pool.query(query, values);
    return rows;
  },
};





module.exports = PlantelesModel;
