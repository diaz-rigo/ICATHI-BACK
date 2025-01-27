// Controlador para manejar las solicitudes
const PlantelesCursosModel = require("../models/planteles_cursosModel");
const pool = require("../config/database"); // Asegúrate de que la ruta sea correcta
// const PlantelesCursosModel = require('../models/planteles_cursosModel');
const cloudinary = require("../config/cloudinary");
const fs = require('fs');

module.exports = {
  // async getByIdPlantel(req, res) {

  async getByIdPlantel(req, res) {
    try {
        const { idPlantel } = req.params;

        const cursos = await PlantelesCursosModel.obtenerCursosPorPlantelDetalle(idPlantel);

        if (!cursos.length) {
            return res.status(404).json({ error: "No se encontraron cursos para este plantel" });
        }

        res.status(200).json(cursos);
    } catch (error) {
        console.error("Error al obtener los cursos:", error);
        res.status(500).json({ error: "Error al obtener los cursos" });
    }
  },

  async getAll(req, res) {
    try {

      const cursos = await PlantelesCursosModel.getAll2(
        // idPlantel
      );
      if (!cursos.length) {
        return res
          .status(404)
          .json({ error: "No se encontraron cursos para este plantel" });
      }

      res.status(200).json(cursos);
    } catch (error) {
      console.error("Error al obtener los cursos:", error);
      res.status(500).json({ error: "Error al obtener los cursos" });
    }
  },
  // eliminia un curso solicitado
  async deleteByIdPlantel(req, res) {
    try {
      const { idPlantel } = req.params; // Extraer el ID del plantel desde los parámetros

      // Llamar al modelo para eliminar los cursos asociados al plantel
      const cursosEliminados =
        await PlantelesCursosModel.eliminarCursosPorPlantel(idPlantel);

      // Verificar si se eliminaron registros
      if (cursosEliminados.rowCount === 0) {
        return res
          .status(404)
          .json({ error: "No se encontraron cursos para este plantel" });
      }

      // Respuesta en caso de éxito
      res.status(200).json({
        message: "Cursos eliminados correctamente",
        count: cursosEliminados.rowCount,
        deleted: cursosEliminados.rows, // Incluye los registros eliminados si se desea
      });
    } catch (error) {
      console.error("Error al eliminar los cursos:", error);
      res.status(500).json({ error: "Error al eliminar los cursos" });
    }
  },
  // Modelo
  async eliminarCursosPorPlantel(plantelId) {
    try {
      const query = `
      DELETE FROM planteles_cursos
      WHERE plantel_id = $1
      RETURNING *;
    `;

      const values = [plantelId];
      const { rowCount, rows } = await pool.query(query, values);

      // Retornar la cantidad de filas eliminadas y los registros eliminados
      return { rowCount, rows };
    } catch (error) {
      console.error("Error al eliminar cursos por plantel:", error);
      throw error; // Lanza el error para manejarlo en el nivel superior
    }
  },


  async registrarSolicitud(req, res) {
    try {
     // Preparar los datos de la solicitud
      const solicitudData = {
        ...req.body,
        // temario_url: uploadResult.secure_url,
      };
  
      // Registrar la solicitud en la base de datos
      const nuevaSolicitud = await PlantelesCursosModel.registrarSolicitud(solicitudData);
  
      res.status(201).json({
        message: "Solicitud registrada exitosamente",
        data: nuevaSolicitud,
      });
    } catch (error) {
      console.error("Error al registrar la solicitud:", error);
  
      res.status(500).json({
        message: "Error al registrar la solicitud",
        error: error.message,
      });
    }
  }
,  
  async obtenerSolicitudes(req, res) {
    try {
      const solicitudes = await PlantelesCursosModel.obtenerSolicitudes();
      res.status(200).json(solicitudes);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Error al obtener las solicitudes",
        error: error.message,
      });
    }
  },
  async getAlumnos(req, res) {
    const { id } = req.params; // Extraer el ID del plantel desde los parámetros
  
    // Validar que el ID sea un número
    if (!id || isNaN(id)) {
      return res.status(400).json({
        message: "El ID del plantel es inválido.",
      });
    }
  
    try {
      const solicitudes = await PlantelesCursosModel.getAlumnosByUsuarioId(id);
  
      // Verificar si se encontraron alumnos
      if (!solicitudes || solicitudes.length === 0) {
        return res.status(404).json({
          message: "No se encontraron alumnos para el plantel especificado.",
        });
      }
  
      res.status(200).json(solicitudes);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Error al obtener los alumnos.",
        error: error.message,
      });
    }
  }
,  
  async actualizarEstatus(req, res) {
    try {
        const { id } = req.params; // Asegúrate de que el ID se esté extrayendo correctamente
        console.log("ID recibido para actualizar:", id); // Depuración
        const { estatus, observacion, sugerencia } = req.body;

        // Llama al modelo para actualizar el estatus
        const solicitudActualizada = await PlantelesCursosModel.actualizarEstatus(
            id,
            estatus,
            observacion,
            sugerencia
        );

        if (!solicitudActualizada) {
            // Si no se encuentra la solicitud, responde con un 404
            return res.status(404).json({
                message: "Solicitud no encontrada",
            });
        }

        // Responde con éxito
        return res.status(200).json({
            message: "Estatus actualizado correctamente",
            data: solicitudActualizada,
        });
    } catch (error) {
        console.error("Error al actualizar el estatus:", error);

        // Manejo de errores
        return res.status(500).json({
            message: "Error al actualizar el estatus",
            error: error.message,
        });
    }
}
,
async obtenerCursoPorId(req, res) {
  try {
    const { idCurso } = req.params; // Extraer el ID del curso desde los parámetros

    const curso = await PlantelesCursosModel.obtenerCursoPorId(idCurso);

    if (!curso) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }

    res.status(200).json(curso);
  } catch (error) {
    console.error("Error al obtener el curso:", error);
    res.status(500).json({ error: "Error al obtener el curso" });
  }
},

async obtenerPlantelesConCursos(req, res) {
  try {
      const query = `
          SELECT 
              pc.id AS id,  -- ID de la relación plantel_curso
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
              cursos c ON pc.curso_id = c.id;
      `;

      const { rows } = await pool.query(query);
      if (rows.length === 0) {
        return res
          .status(404)
          .json({ message: "No se encontraron planteles con cursos" });
      }
      res.status(200).json(rows);
    } catch (error) {
      console.error("Error al obtener planteles con cursos:", error);
      res.status(500).json({
        message: "Error al obtener planteles con cursos",
        error: error.message,
      });
    }
  },
  async obtenerPlantelesConCursosValidados(req, res) {
    try {
      const plantelesConCursosValidados =
        await PlantelesCursosModel.obtenerPlantelesConCursosValidados();
      res.status(200).json(plantelesConCursosValidados);
    } catch (error) {
      console.error("Error al obtener planteles con cursos validados:", error);
      res.status(500).json({
        message: "Error al obtener planteles con cursos validados",
        error: error.message,
      });
    }
  },

  async obtenerPlantelesConCursosNoValidados(req, res) {
    try {
      const plantelesConCursosNoValidados =
        await PlantelesCursosModel.obtenerPlantelesConCursosNoValidados();
      res.status(200).json(plantelesConCursosNoValidados);
    } catch (error) {
      console.error(
        "Error al obtener planteles con cursos no validados:",
        error
      );
      res.status(500).json({
        message: "Error al obtener planteles con cursos no validados",
        error: error.message,
      });
    }
  },
  async obtenerInfoPlantelCurso(req, res) {
    try {
      const { idPlantelCurso } = req.params;

      const info = await PlantelesCursosModel.obtenerInfoPlantelCursoCompleta(
        idPlantelCurso
      );
      res.status(200).json(info);
    } catch (error) {
      console.error("Error al obtener la info:", error);
      res.status(500).json({
        message: "Error al obtener la info",
        error: error.message,
      });
    }
  },
  
  async obtenerDetalleCursosPorPlantel(req, res) {
    try {
      const { idPlantelCurso } = req.params;

      const info = await PlantelesCursosModel.obtenerDetalleCursosPorPlantel(
        idPlantelCurso
      );
      res.status(200).json(info);
    } catch (error) {
      console.error("Error al obtener la info:", error);
      res.status(500).json({
        message: "Error al obtener la info",
        error: error.message,
      });
    }
  },
  async getCursosConEstado(req, res) {
    try {
      const { idPlantel } = req.params;

      const info = await PlantelesCursosModel.getCursosConEstado(
        idPlantel
      );
      res.status(200).json(info);
    } catch (error) {
      console.error("Error al obtener la info:", error);
      res.status(500).json({
        message: "Error al obtener la info",
        error: error.message,
      });
    }
  },
  async getInfo(req, res) {
    try {
      const { idPlantel } = req.params;

      const info = await PlantelesCursosModel.getInfoByPlantel(
        idPlantel
      );
      res.status(200).json(info);
    } catch (error) {
      console.error("Error al obtener la info:", error);
      res.status(500).json({
        message: "Error al obtener la info",
        error: error.message,
      });
    }
  },

  async updateCourse_solicitud_ById(req, res) {
    try {
      const { id } = req.params;
      const data = req.body;

      // Validar que el ID sea numérico
      if (isNaN(id)) {
        return res.status(400).json({ error: "El ID del curso debe ser un número válido." });
      }
      console.log("*********actualizar solicitud ---__",req.body)
      // Llamar al modelo para actualizar el curso
      const cursoActualizado = await PlantelesCursosModel.updateCourse_solicitud_ById(id, data);

      if (!cursoActualizado) {
        return res.status(404).json({ error: "No se encontró el curso para actualizar." });
      }

      res.status(200).json({
        message: "Curso actualizado con éxito",
        curso: cursoActualizado,
      });
    } catch (error) {
      console.error("Error al actualizar el curso:", error);
      res.status(500).json({ error: "Error al actualizar el curso" });
    }
  },

  async obtenerInfoPlantelCurso2(req, res) {
    try {
        // Obtener todos los cursos y planteles sin filtrar por id
        const info = await PlantelesCursosModel.obtenerTodosLosCursosYPlanteles();

        if (!info.length) {
            return res.status(404).json({ error: "No se encontraron cursos o planteles" });
        }

        res.status(200).json(info);
    } catch (error) {
        console.error("Error al obtener la info:", error);
        res.status(500).json({
            message: "Error al obtener la info",
            error: error.message,
        });
    }
},
 async obtenerSolicitudescompletas(req, res) {
  try {
    // Obtener todos los cursos y planteles sin filtrar por id
    const info = await PlantelesCursosModel.obtenerSolicitudescompletas();

    if (!info.length) {
        return res.status(404).json({ error: "No se encontraron cursos o planteles" });
    }

    res.status(200).json(info);
} catch (error) {
    console.error("Error al obtener la info:", error);
    res.status(500).json({
        message: "Error al obtener la info",
        error: error.message,
    });
}

},

async obtenerCursosPorPlantel(req, res) {
  try {
    // Obtener el ID del plantel desde los parámetros de la solicitud
    const { plantelId } = req.params;

    // Obtener los cursos asociados al plantel
    const info = await PlantelesCursosModel.obtenerCursosPorPlantel(plantelId);

    if (!info.length) {
      return res.status(404).json({ error: "No se encontraron cursos para el plantel especificado" });
    }

    res.status(200).json(info);
  } catch (error) {
    console.error("Error al obtener los cursos por plantel:", error);
    res.status(500).json({
      message: "Error al obtener los cursos por plantel",
      error: error.message,
    });
  }
},
async  obtenerDetalleCursocompletoPorId(req, res) {
  try {
    const { idCurso } = req.params;

    const detalleCurso = await PlantelesCursosModel.obtenerDetalleCursocompletoPorId(idCurso);

    if (!detalleCurso) {
      return res.status(404).json({ error: "Curso no encontrado" });
    }

    res.status(200).json(detalleCurso);
  } catch (error) {
    console.error("Error al obtener el detalle del curso por ID:", error);
    res.status(500).json({
      message: "Error al obtener el detalle del curso por ID",
      error: error.message,
    });
  }
}
};
