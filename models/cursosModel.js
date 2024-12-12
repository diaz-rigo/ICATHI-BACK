const pool = require('../config/database');  

const CursosModel = {  
  async getAll() {  
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
        c.estatus  -- Asegúrate de incluir este campo  

      FROM cursos c  
      JOIN areas a ON c.area_id = a.id  
      JOIN especialidades e ON c.especialidad_id = e.id  
      JOIN tipos_curso t ON c.tipo_curso_id = t.id  
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
        nivel,  
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
      curso.nivel || 'Básico', // Valor predeterminado  
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

  async updateValidado(id, validado, estatus) {      
    const query = `      
      UPDATE cursos      
      SET validado = \$1, estatus = \$2      
      WHERE id = \$3      
      RETURNING *      
    `;      
    const values = [validado, estatus, id];      
    const { rows } = await pool.query(query, values);      
    return rows[0];      
}  ,

  async getByStatus(estatus) {  
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
      WHERE c.estatus = \$1  
    `;  
    const { rows } = await pool.query(query, [estatus]);  
    return rows;  
  },  
};  

module.exports = CursosModel; // Asegúrate de exportar el modelo  