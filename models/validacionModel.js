const pool = require("../config/database");

const ValidacionModel = {
  /**
   * Obtiene la información para el dictamen por ID de solicitud
   */
  async getDictamenBySolicitudId(solicitudId) {
    const query = `
      SELECT
        sc.id                                AS solicitud_id,
        sc.curso_id                          AS "curso_id",
        sc.docente_id                        AS "docente_id",
        sc.prioridad                         AS prioridad,
        sc.justificacion                     AS justificacion,
        sc.estado                            AS estado,
        sc.respuesta_mensaje                 AS "respuestaMensaje",
        sc.evaluador_id                      AS "evaluadorId",
        sc.fecha_respuesta                   AS "fechaRespuesta",
        sc.fecha_solicitud                   AS "fechaSolicitud",

        d.nombre                             AS "docente_nombre",
        d.apellidos                          AS "docente_apellidos",
        d.email                              AS "docente_email",
        d.telefono                           AS "docente_telefono",

        c.nombre                             AS "curso_nombre",
        c.clave                              AS "curso_clave",
        c.modalidad                          AS "curso_modalidad",
        c.duracion_horas                     AS "curso_duracion_horas",

        tc.nombre                            AS "tipo_curso_nombre"
      FROM solicitudes_cursos sc
      JOIN docentes d ON d.id = sc.docente_id
      JOIN cursos   c ON c.id = sc.curso_id
      JOIN tipos_curso tc ON tc.id = c.tipo_curso_id
      WHERE sc.id = $1
      LIMIT 1;
    `;
    const { rows } = await pool.query(query, [solicitudId]);
    return rows[0] || null;
  },


};

module.exports = ValidacionModel;
