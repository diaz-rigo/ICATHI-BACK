// Controlador para manejar las solicitudes
const PlantelesCursosModel = require("../models/planteles_cursosModel");
const pool = require("../config/database"); // Asegúrate de que la ruta sea correcta
// const PlantelesCursosModel = require('../models/planteles_cursosModel');

module.exports = {
  // async getByIdPlantel(req, res) {

  async getByIdPlantel(req, res) {
    try {
      const { idPlantel } = req.params;

      // Realiza el INNER JOIN para obtener los cursos del plantel
      // const cursos = await PlantelesCursosModel.obtenerCursosPorPlantel(
      //   idPlantel
      // );

      const cursos = await PlantelesCursosModel.obtenerCursosPorPlantel(
        idPlantel
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
  // Controlador
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
      // Llamar al modelo para registrar la solicitud
      const nuevaSolicitud = await PlantelesCursosModel.registrarSolicitud(
        req.body
      );

      // Imprimir los datos de la solicitud para depuración
      console.log("Solicitud registrada exitosamente:", nuevaSolicitud);

      // Responder con los datos registrados
      res.status(201).json({
        message: "Solicitud registrada exitosamente",
        data: nuevaSolicitud,
      });
    } catch (error) {
      console.error("Error al registrar la solicitud:", error);

      // Enviar respuesta de error
      res.status(500).json({
        message: "Error al registrar la solicitud",
        error: error.message,
      });
    }
  },
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
  async actualizarEstatus(req, res) {
    try {
      const { id } = req.params; // Asegúrate de que el ID se esté extrayendo correctamente
      console.log("ID recibido para actualizar:", id); // Depuración
      const { estatus, observacion } = req.body;

      // Llama al modelo para actualizar el estatus
      const solicitudActualizada = await PlantelesCursosModel.actualizarEstatus(
        id,
        estatus,
        observacion
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

      const info =
        await PlantelesCursosModel.obtenerInfoPlantelCurso(idPlantelCurso);
      res.status(200).json(info);
    } catch (error) {
      console.error(
        "Error al obtener la info:",
        error
      );
      res.status(500).json({
        message: "Error al obtener la info",
        error: error.message,
      });
    }
  },
};
