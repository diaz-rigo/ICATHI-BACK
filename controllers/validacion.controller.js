const ValidacionModel = require("../models/validacionModel");

function formatDate(date) {
  if (!date) return "";
  const d = new Date(date);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

const getDictamenBySolicitud = async (req, res) => {
  const { solicitudId } = req.params;

  try {
    const r = await ValidacionModel.getDictamenBySolicitudId(solicitudId);
    if (!r) return res.status(404).json({ ok: false, message: "Solicitud no encontrada" });

    const validado = (r.estado || "").toLowerCase() === "aprobado";
    const folio = `DA-${String(r.solicitud_id).padStart(6, "0")}`;
    const fechaConvoco = formatDate(r.fechaSolicitud);
    const fechaRespuesta = r.fechaRespuesta ? formatDate(r.fechaRespuesta) : "";

    const payload = {
      folio,
      solicitudId: r.solicitud_id,
      // Candidato
      candidatoNombreCompleto: `${r.docente_nombre} ${r.docente_apellidos}`.trim(),
      candidatoTelefono: r.docente_telefono || "",
      candidatoEmail: r.docente_email || "",
      // Curso
      curso: {
        id: r.curso_id,
        nombre: r.curso_nombre,
        clave: r.curso_clave,
        modalidad: r.curso_modalidad,
        duracionHoras: r.curso_duracion_horas,
        tipo: r.tipo_curso_nombre || "",   // 👈 aquí agregamos el nombre del tipo de curso
      },
      // Estados / fechas
      estado: r.estado,
      validado,
      fechaConvoco,
      fechaRespuesta,
      // Criterios
      criterioPrimera:
        "El puntaje mínimo para acreditar el examen teórico y la entrevista que se le aplica a la/el candidata/o a docente es de 7.56.",
      criterioSegunda: "El puntaje mínimo para acreditar el examen teórico es de 7.56.",
      // Campo libre
      reforzarTemas: r.respuestaMensaje || "",
      // Metadatos
      prioridad: r.prioridad,
      justificacion: r.justificacion,
    };

    return res.json({ ok: true, data: payload });
  } catch (err) {
    console.error("getDictamenBySolicitud error:", err);
    return res.status(500).json({ ok: false, message: "Error interno", error: err?.message });
  }
};

module.exports = { getDictamenBySolicitud };
