const pool = require("../config/database");

const CursosModel = {
  async getAll() {
    const query = `
      SELECT 
        c.id, 
        c.nombre, 
        c.clave,
        c.duracion_horas,
        c.descripcion, -- Incluimos el campo descripcion
        c.area_id,
        a.nombre AS area_nombre,
        c.especialidad_id,
        e.nombre AS especialidad_nombre,
        c.tipo_curso_id,
        c.estatus,
        t.nombre AS tipo_curso_nombre,
        c.vigencia_inicio,
        c.fecha_publicacion,
        c.ultima_actualizacion
      FROM cursos c
      JOIN areas a ON c.area_id = a.id
      JOIN especialidades e ON c.especialidad_id = e.id
      JOIN tipos_curso t ON c.tipo_curso_id = t.id
    `;
    const { rows } = await pool.query(query);
    return rows;
  },
  async getAllByIdPlantel(idPlantel) {
    const query = `
    SELECT 
  c.id, 
  c.nombre, 
  c.clave,
  c.duracion_horas,
  c.descripcion,
  c.area_id,
  a.nombre AS area_nombre,
  c.especialidad_id,
  e.nombre AS especialidad_nombre,
  c.tipo_curso_id,
  c.estatus,
  t.nombre AS tipo_curso_nombre,
  c.vigencia_inicio,
  c.fecha_publicacion,
  c.ultima_actualizacion
FROM planteles_cursos pc
JOIN cursos c ON pc.curso_id = c.id
JOIN areas a ON c.area_id = a.id
JOIN especialidades e ON c.especialidad_id = e.id
JOIN tipos_curso t ON c.tipo_curso_id = t.id
WHERE pc.plantel_id = ${idPlantel} AND pc.estatus = true


    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  async getById(id) {  
    const query = `  
      SELECT   
        c.id,   
        c.nombre,   
        c.clave,  
        c.duracion_horas,  
        c.descripcion,  
        c.area_id,  
        a.nombre AS area_nombre,  
        c.especialidad_id,  
        e.nombre AS especialidad_nombre,  
        c.tipo_curso_id,  
        t.nombre AS tipo_curso_nombre,  
        c.vigencia_inicio,  
        c.fecha_publicacion,  
        c.ultima_actualizacion  
      FROM cursos c  
      JOIN areas a ON c.area_id = a.id  
      JOIN especialidades e ON c.especialidad_id = e.id  
      JOIN tipos_curso t ON c.tipo_curso_id = t.id  
      WHERE c.id = \$1  
    `;  
    const { rows } = await pool.query(query, [id]);  
    return rows[0];  
  },  

  async create(curso) {
    const query = `
      INSERT INTO cursos (
        nombre, 
        clave, 
        duracion_horas, 
        descripcion, 
        nivel, -- Incluimos el campo nivel
        area_id, 
        especialidad_id, 
        tipo_curso_id, 
        vigencia_inicio, 
        fecha_publicacion, 
        ultima_actualizacion
      )
      VALUES (\$1, \$2, \$3, \$4, \$5, \$6, \$7, \$8, \$9, \$10, \$11) 
      RETURNING *
    `;
    const values = [
      curso.nombre,
      curso.clave,
      curso.duracion_horas,
      curso.descripcion,
      curso.nivel || "Básico", // Valor predeterminado
      curso.area_id,
      curso.especialidad_id,
      curso.tipo_curso_id,
      curso.vigencia_inicio || null,
      curso.fecha_publicacion || null,
      curso.ultima_actualizacion || null,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async update(id, curso) {        
    const query = `        
      UPDATE cursos        
      SET         
        nombre = \$1,        
        clave = \$2,        
        duracion_horas = \$3,        
        descripcion = \$4,        
        area_id = \$5,        
        especialidad_id = \$6,        
        tipo_curso_id = \$7,        
        vigencia_inicio = \$8,        
        fecha_publicacion = \$9,        
        ultima_actualizacion = \$10,        
        estatus = \$11      
      WHERE id = \$12        
      RETURNING *        
    `;        

    const values = [        
        curso.nombre,        
        curso.clave || null,    
        curso.duracion_horas,        
        curso.descripcion,        
        curso.area_id,        
        curso.especialidad_id,        
        curso.tipo_curso_id,        
        curso.vigencia_inicio || null,        
        curso.fecha_publicacion || null,        
        curso.ultima_actualizacion || null,        
        curso.estatus,      
        id,        
    ];        

    const { rows } = await pool.query(query, values);        
    return rows[0];        
}  ,

  async delete(id) {  
    const query = 'DELETE FROM cursos WHERE id = \$1 RETURNING *';  
    const { rows } = await pool.query(query, [id]);  
    return rows[0];  
  },  

  async delete(id) {
    const query = "DELETE FROM cursos WHERE id = $1 RETURNING *"; // Consulta para eliminar el curso
    const { rows } = await pool.query(query, [id]); // Ejecuta la consulta con el ID
    return rows[0]; // Devuelve el curso eliminado
  },
  async getCursosByAreaIdByEspecialidadId(areaId, especialidadId) {
    //sobcunsulta para tomar el curso por area y especialidad
    const query = `
      SELECT 
        c.id, 
        c.nombre, 
        c.clave,
        c.duracion_horas,
        c.descripcion,
        c.area_id,
        a.nombre AS area_nombre,
        c.especialidad_id,
        e.nombre AS especialidad_nombre,
        c.tipo_curso_id,
        c.estatus,
        t.nombre AS tipo_curso_nombre,
        c.vigencia_inicio,
        c.fecha_publicacion,
        c.ultima_actualizacion
      FROM cursos c
      JOIN areas a ON c.area_id = a.id
      JOIN especialidades e ON c.especialidad_id = e.id
      JOIN tipos_curso t ON c.tipo_curso_id = t.id
      WHERE c.area_id = $1 AND c.especialidad_id = $2
    `;
    const { rows } = await pool.query(query, [areaId, especialidadId]);
    return rows;
  },
  async getCursosByEspecialidadId(especialidadId, plantelId) {
    const query = `
      SELECT 
        c.id, 
        c.nombre, 
        c.descripcion, 
        c.duracion_horas, 
        c.nivel, 
        c.costo, 
        c.requisitos, 
        c.estatus, 
        c.created_at, 
        c.updated_at, 
        c.usuario_validador_id, 
        c.fecha_validacion, 
        c.modalidad, 
        c.clave, 
        c.area_id, 
        c.especialidad_id, 
        c.tipo_curso_id, 
        c.vigencia_inicio, 
        c.fecha_publicacion, 
        c.ultima_actualizacion,
        CASE 
          WHEN pc.curso_id IS NOT NULL THEN true
          ELSE false
        END AS registrado
      FROM 
        cursos c
      LEFT JOIN 
        planteles_cursos pc 
        ON c.id = pc.curso_id AND pc.plantel_id = $2
      WHERE 
        c.especialidad_id = $1
    `;
  
    try {
      const { rows } = await pool.query(query, [especialidadId, plantelId]);
      return rows;
    } catch (error) {
      console.error("Error al obtener los cursos:", error);
      throw error;
    }
  }
  
  
};

module.exports = CursosModel;
