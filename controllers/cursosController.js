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
  
exports.getAllByIdPlantel = async (req, res) => {  
  try {  
    const { idPlantel } = req.params;  

    const cursos = await CursosModel.getAllByIdPlantel(idPlantel);  
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
  const client = await pool.connect(); // Para manejar transacciones
  try {
    console.log('Datos recibidos del frontend:', req.body);

    const {
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
      ultima_actualizacion,
      objetivos,
      materiales,
      equipamiento,
    } = req.body;

    // Validación de los campos obligatorios (sin incluir materiales y equipamiento)
    if (!nombre || !clave || !duracion_horas || !descripcion || !area_id || !especialidad_id || !tipo_curso_id) {
      return res.status(400).json({ error: 'Los campos obligatorios deben completarse' });
    }

    await client.query('BEGIN');

    // Insertar el curso
    const cursoQuery = `
      INSERT INTO cursos (
        nombre, clave, duracion_horas, descripcion, nivel, area_id, especialidad_id, tipo_curso_id, vigencia_inicio, fecha_publicacion, ultima_actualizacion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id
    `;
    const cursoValues = [
      nombre,
      clave,
      duracion_horas,
      descripcion,
      nivel || 'Básico',
      area_id,
      especialidad_id,
      tipo_curso_id,
      vigencia_inicio || null,
      fecha_publicacion || null,
      ultima_actualizacion || null,
    ];
    const { rows: cursoRows } = await client.query(cursoQuery, cursoValues);
    const cursoId = cursoRows[0].id;

    // Insertar objetivos si están presentes
    if (objetivos) {
      const fichaQuery = `
        INSERT INTO ficha_tecnica (
          id_curso, objetivo, perfil_ingreso, perfil_egreso, perfil_del_docente, metodologia, bibliografia, criterios_acreditacion, reconocimiento
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `;
      const fichaValues = [
        cursoId,
        objetivos.objetivo || '',
        objetivos.perfil_ingreso || '',
        objetivos.perfil_egreso || '',
        objetivos.perfil_del_docente || '',
        objetivos.metodologia || '',
        objetivos.bibliografia || '',
        objetivos.criterios_acreditacion || '',
        objetivos.reconocimiento || '',
      ];
      await client.query(fichaQuery, fichaValues);
    }

    // Insertar materiales solo si están presentes
    if (Array.isArray(materiales)) {
      const materialQuery = `
        INSERT INTO material (descripcion, unidad_de_medida, cantidad_10, cantidad_15, cantidad_20)
        VALUES ($1, $2, $3, $4, $5)
      `;
      for (const material of materiales) {
        if (!material.descripcion || !material.unidad_de_medida) {
          throw new Error('Materiales incompletos detectados');
        }
        const materialValues = [
          material.descripcion,
          material.unidad_de_medida,
          material.cantidad_10 || 0,
          material.cantidad_15 || 0,
          material.cantidad_20 || 0,
        ];
        await client.query(materialQuery, materialValues);
      }
    }

    // Insertar equipamiento solo si está presente
    if (Array.isArray(equipamiento)) {
      const equipamientoQuery = `
        INSERT INTO equipamiento (descripcion, unidad_de_medida, cantidad_10, cantidad_15, cantidad_20)
        VALUES ($1, $2, $3, $4, $5)
      `;
      for (const equipo of equipamiento) {
        if (!equipo.descripcion || !equipo.unidad_de_medida) {
          throw new Error('Equipamiento incompleto detectado');
        }
        const equipamientoValues = [
          equipo.descripcion,
          equipo.unidad_de_medida,
          equipo.cantidad_10 || 0,
          equipo.cantidad_15 || 0,
          equipo.cantidad_20 || 0,
        ];
        await client.query(equipamientoQuery, equipamientoValues);
      }
    }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Curso registrado exitosamente', cursoId });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al registrar el curso:', error);
    res.status(500).json({ error: error.message || 'Error al registrar el curso' });
  } finally {
    client.release();
  }
};



// original=>exports.create = async (req, res) => {  
//   try {  
//     console.log('Datos recibidos del frontend:', req.body); // Verifica los datos  
  
//     const { nombre, clave, duracion_horas, descripcion, area_id, especialidad_id, tipo_curso_id } = req.body;  
  
//     // Validar campos obligatorios  
//     if (!nombre || !clave || !duracion_horas || !descripcion || !area_id || !especialidad_id || !tipo_curso_id) {  
//       return res.status(400).json({ error: 'Todos los campos obligatorios deben ser completados' });  
//     }  
  
//     const nuevoCurso = await CursosModel.create(req.body);  
//     res.status(201).json(nuevoCurso);  
//   } catch (error) {  
//     console.error('Error al crear el curso:', error);  
//     res.status(500).json({ error: 'Error al crear el curso' });  
//   }  
// };  
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

exports.getDetailedCursos = async (req, res) => {
  try {
    const cursos = await CursosModel.getDetailedCursos();
    res.status(200).json(cursos);
  } catch (error) {
    console.error('Error al obtener los cursos detallados:', error);
    res.status(500).json({ error: 'Error al obtener los cursos detallados' });
  }
};



exports.getCursosByEspecialidadId=async(req, res)=> {
  try {
    const especialidadId = Number(req.params.especialidadId);
    const plantelId = Number(req.params.plantelId);
    const cursos = await CursosModel.getCursosByEspecialidadId(especialidadId,plantelId);
    res.status(200).json(cursos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los cursos' });
  
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const cursoActualizado = await CursosModel.updateStatus(id);
    if (!cursoActualizado) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    res.status(200).json(cursoActualizado);
  } catch (error) {
    console.error('Error al actualizar el estatus del curso:', error);
    res.status(500).json({ error: 'Error al actualizar el estatus del curso' });
  }
};

exports.getAllByIdDocente =async (req, res) => {
  try {
    const { idDocente } = req.params;
    const cursos = await CursosModel.getCursosByIdDocente(idDocente);
    res.status(200).json(cursos);
  } catch (error) {
    console.error(`Error al obtener los cursos del docente`, error);
    res.status(500).json({ error: 'Error al obtener los cursos' });
  }
};
exports.getCourseDetails = async (req, res) => {
  const { id } = req.params; // ID del curso a buscar
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Obtener datos básicos del curso
    const cursoQuery = `
      SELECT 
        c.id, c.nombre, c.clave, c.duracion_horas, c.descripcion, c.nivel, 
        c.area_id, c.especialidad_id, c.tipo_curso_id, c.vigencia_inicio, 
        c.fecha_publicacion, c.ultima_actualizacion
      FROM cursos c
      WHERE c.id = $1
    `;
    const cursoResult = await client.query(cursoQuery, [id]);

    if (cursoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Curso no encontrado' });
    }

    const curso = cursoResult.rows[0];

    // Obtener la ficha técnica del curso
    const fichaQuery = `
      SELECT 
        objetivo, perfil_ingreso, perfil_egreso, perfil_del_docente, 
        metodologia, bibliografia, criterios_acreditacion, reconocimiento
      FROM ficha_tecnica
      WHERE id_curso = $1
    `;
    const fichaResult = await client.query(fichaQuery, [id]);
    const fichaTecnica = fichaResult.rows[0] || {};

    // Obtener los materiales del curso
    const materialesQuery = `
      SELECT descripcion, unidad_de_medida, cantidad_10, cantidad_15, cantidad_20
      FROM material
      WHERE id_curso = $1
    `;
    const materialesResult = await client.query(materialesQuery, [id]);

    // Obtener el equipamiento del curso
    const equipamientoQuery = `
      SELECT descripcion, unidad_de_medida, cantidad_10, cantidad_15, cantidad_20
      FROM equipamiento
      WHERE id_curso = $1
    `;
    const equipamientoResult = await client.query(equipamientoQuery, [id]);

    // Formar la respuesta con todos los detalles del curso
    const cursoDetalles = {
      ...curso,
      fichaTecnica,
      materiales: materialesResult.rows,
      equipamiento: equipamientoResult.rows,
    };

    await client.query('COMMIT');
    res.status(200).json(cursoDetalles);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al obtener los detalles del curso:', error);
    res.status(500).json({ error: error.message || 'Error al obtener los detalles del curso' });
  } finally {
    client.release();
  }
};




