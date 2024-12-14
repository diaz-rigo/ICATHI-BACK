const CursosModel = require('../models/cursosModel');  
const pool = require('../config/database'); 
  
exports.getAll = async (req, res) => {  
  try {  
    const cursos = await CursosModel.getAll();  
    res.status(200).json(cursos);  
  } catch (error) {  
    console.error('Error al obtener los cursos:', error);  
    res.status(500).json({ error: 'Error al obtener los cursos' });  
  }  
};  
  
exports.getById = async (req, res) => {  
  try {  
    const { id } = req.params;  
    const curso = await CursosModel.getById(id);  
    if (!curso) {  
      return res.status(404).json({ error: 'Curso no encontrado' });  
    }  
    res.status(200).json(curso);  
  } catch (error) {  
    console.error('Error al obtener el curso:', error);  
    res.status(500).json({ error: 'Error al obtener el curso' });  
  }  
};  
  
exports.create = async (req, res) => {  
  try {  
    console.log('Datos recibidos del frontend:', req.body); // Verifica los datos  
  
    const { nombre, clave, duracion_horas, descripcion, area_id, especialidad_id, tipo_curso_id } = req.body;  
  
    // Validar campos obligatorios  
    if (!nombre || !clave || !duracion_horas || !descripcion || !area_id || !especialidad_id || !tipo_curso_id) {  
      return res.status(400).json({ error: 'Todos los campos obligatorios deben ser completados' });  
    }  
  
    const nuevoCurso = await CursosModel.create(req.body);  
    res.status(201).json(nuevoCurso);  
  } catch (error) {  
    console.error('Error al crear el curso:', error);  
    res.status(500).json({ error: 'Error al crear el curso' });  
  }  
};  
exports.update = async (req, res) => {        
  try {        
      const { id } = req.params;        
      const { nombre, clave, duracion_horas, descripcion, area_id, especialidad_id, tipo_curso_id, estatus } = req.body;        

      // Validar campos obligatorios        
      if (!nombre || !duracion_horas || !descripcion || !area_id || !especialidad_id || !tipo_curso_id) {        
          return res.status(400).json({ error: 'Todos los campos obligatorios deben ser completados' });        
      }        

      console.log('Datos recibidos para actualización:', req.body); // Para depuración    

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
          nombre,        
          clave || null,    
          duracion_horas,        
          descripcion,        
          area_id,        
          especialidad_id,        
          tipo_curso_id,        
          null,    
          null,    
          null,    
          estatus,      
          id,        
      ];        

      console.log('Consulta SQL:', query); // Log de la consulta    
      console.log('Valores de la consulta:', values); // Log de los valores    

      const { rows } = await pool.query(query, values);        
      if (rows.length === 0) {    
          return res.status(404).json({ error: 'Curso no encontrado' });    
      }    
      res.status(200).json(rows[0]);        
  } catch (error) {        
      console.error('Error al actualizar el curso:', error);    
      res.status(500).json({ error: 'Error al actualizar el curso', details: error.message });    
  }        
};    
exports.delete = async (req, res) => {  
  try {  
    const { id } = req.params; // Obtiene el ID del curso a eliminar  
    const cursoEliminado = await CursosModel.delete(id); // Llama al modelo para eliminar el curso  
  
    if (!cursoEliminado) {  
      return res.status(404).json({ error: 'Curso no encontrado' }); // Si no se encuentra el curso, devuelve 404  
    }  
  
    res.status(200).json(cursoEliminado); // Devuelve el curso eliminado  
  } catch (error) {  
    console.error('Error al eliminar el curso:', error); // Log del error  
    res.status(500).json({ error: 'Error al eliminar el curso' }); // Devuelve un error 500  
  }  
};  
  
// Método para actualizar el campo 'validado' de un curso  
exports.updateValidado = async (req, res) => {    
  try {    
    const { id } = req.params;    
    const { validado, estatus } = req.body;  // Asegúrate de recibir estatus  

    // Validar que 'validado' sea booleano    
    if (typeof validado !== 'boolean' || typeof estatus !== 'boolean') {    
      return res.status(400).json({ error: 'Los campos "validado" y "estatus" son obligatorios y deben ser booleanos' });    
    }    

    const cursoActualizado = await CursosModel.updateValidado(id, validado, estatus);  // Asegúrate de pasar estatus  
    if (!cursoActualizado) {    
      return res.status(404).json({ error: 'Curso no encontrado' });    
    }    
    res.status(200).json(cursoActualizado);    
  } catch (error) {    
    console.error('Error al actualizar el estado validado del curso:', error);    
    res.status(500).json({ error: 'Error al actualizar el estado validado del curso' });    
  }    
};  
  
// Método para obtener cursos por estatus  
exports.getByStatus = async (req, res) => {  
  try {  
    const { estatus } = req.params;  
  
    // Validar que 'estatus' sea booleano  
    if (estatus !== 'true' && estatus !== 'false') {  
      return res.status(400).json({ error: 'El campo "estatus" debe ser "true" o "false"' });  
    }  
  
    const cursos = await CursosModel.getByStatus(estatus === 'true');  
    res.status(200).json(cursos);  
  } catch (error) {  
    console.error('Error al obtener los cursos por estatus:', error);  
    res.status(500).json({ error: 'Error al obtener los cursos por estatus' });  
  }  
};  


exports.getCursosByAreaIdByEspecialidadId = async (req, res) => {
  try {
    const { areaId, especialidadId } = req.query;
    const cursos = await CursosModel.getCursosByAreaIdByEspecialidadId(areaId, especialidadId);
    res.status(200).json(cursos);
  } catch (error) {
    console.error('Error al obtener los cursos:', error);
    res.status(500).json({ error: 'Error al obtener los cursos' });
  }
};






exports.getCursosByEspecialidadId=async(req, res)=> {
  try {
    const especialidadId = Number(req.params.especialidadId);
    const cursos = await CursosModel.getCursosByEspecialidadId(especialidadId);
    res.status(200).json(cursos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los cursos' });
  }
}



