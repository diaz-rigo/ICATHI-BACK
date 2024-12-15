const pool = require('../config/database');

const PlantelesCursos = {
  
   async solicitaCurso (req, res)  {
    try {
      console.log('Datos recibidos del frontend:', req.body);
  
      // Extraer campos del cuerpo de la solicitud
      const {
        nombre,
        clave,
        duracion_horas,
        descripcion,
        area_id,
        especialidad_id,
        tipo_curso_id,
        plantel_id
      } = req.body;
  
      // Validar campos obligatorios
      if (!nombre || !clave || !duracion_horas || !descripcion || !area_id || !especialidad_id || !tipo_curso_id || !plantel_id) {
        return res.status(400).json({ error: 'Todos los campos obligatorios deben ser completados' });
      }
  
      // Crear el curso en la base de datos
      const nuevoCurso = await CursosModel.create({
        nombre,
        clave,
        duracion_horas,
        descripcion,
        area_id,
        especialidad_id,
        tipo_curso_id
      });
  
      // Crear la relación curso-plantel
      const nuevaRelacionPlantelCurso = await PlantelesCursos.registrarSolicitud({
        curso_id: nuevoCurso.id,  // Asumiendo que el ID del curso se devuelve después de la inserción
        plantel_id
      });
  
      // Confirmar operación
      res.status(201).json({
        mensaje: 'Curso creado con éxito y relación con el plantel registrada',
        curso_id: nuevoCurso.id,
        plantelcurso_id: nuevaRelacionPlantelCurso.id
      });
    } catch (error) {
      console.error('Error al crear el curso o la relación:', error);
      res.status(500).json({ error: 'Error al crear el curso o la relación con el plantel' });
    }
  }
,  
  
  
  
  
  
  async registrarSolicitud(data) {
    const {
      plantel_id,
      curso_id,
      horario = '',
      cupo_maximo,
      requisitos_extra = '',
      fecha_inicio = null,
      fecha_fin = null
    } = data;

    const query = `
      INSERT INTO planteles_cursos (plantel_id, curso_id, horario, cupo_maximo, requisitos_extra, fecha_inicio, fecha_fin)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

    const values = [plantel_id, curso_id, horario, cupo_maximo, requisitos_extra, fecha_inicio, fecha_fin];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async obtenerSolicitudes() {
    const query = 'SELECT * FROM planteles_cursos;';
    const { rows } = await pool.query(query);
    return rows;
  },

  async actualizarEstatus(id, estatus, observacion = null) {
    const query = `
        UPDATE planteles_cursos
        SET estatus = \$1, requisitos_extra = COALESCE(\$2, requisitos_extra), updated_at = now()
        WHERE id = \$3
        RETURNING *;
    `;

    const values = [estatus, observacion, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
},

  async obtenerPlantelesConCursos(req, res) {
    try {
        const plantelesConCursos = await PlantelesCursosModel.obtenerPlantelesConCursos();
        res.status(200).json(plantelesConCursos);
    } catch (error) {
        console.error('Error al obtener planteles con cursos:', error);
        res.status(500).json({
            message: 'Error al obtener planteles con cursos',
            error: error.message
        });
    }
},

async obtenerPlantelesConCursosValidados() {
  const query = `
      SELECT 
          pc.id AS id,
          p.id AS plantel_id,
          p.nombre AS plantel_nombre,
          c.id AS curso_id,
          c.nombre AS curso_nombre,
          pc.estatus AS curso_validado
      FROM 
          planteles_cursos pc
      JOIN 
          planteles p ON pc.plantel_id = p.id
      JOIN 
          cursos c ON pc.curso_id = c.id
      WHERE 
          pc.estatus = true;  -- Solo cursos validados
  `;

  const { rows } = await pool.query(query);
  return rows;
},

async obtenerPlantelesConCursosNoValidados() {
  const query = `
      SELECT 
          pc.id AS id,
          p.id AS plantel_id,
          p.nombre AS plantel_nombre,
          c.id AS curso_id,
          c.nombre AS curso_nombre,
          pc.estatus AS curso_validado
      FROM 
          planteles_cursos pc
      JOIN 
          planteles p ON pc.plantel_id = p.id
      JOIN 
          cursos c ON pc.curso_id = c.id
      WHERE 
          pc.estatus = false;  -- Solo cursos no validados
  `;

  const { rows } = await pool.query(query);
  return rows;
},

async obtenerCursosPorPlantel(idPlantel) {
  const query = `
    SELECT 
        pc.id AS id,
        p.id AS plantel_id,
        p.nombre AS plantel_nombre,
        c.id AS curso_id,
        c.nombre AS curso_nombre,
        pc.estatus AS curso_validado
    FROM 
        planteles_cursos pc
    JOIN 
        planteles p ON pc.plantel_id = p.id
    JOIN 
        cursos c ON pc.curso_id = c.id
    WHERE 
        p.id = \$1;  -- Filtrar por el ID del plantel
  `;

  const values = [idPlantel];
  const { rows } = await pool.query(query, values);
  return rows;
}, };

module.exports = PlantelesCursos;
