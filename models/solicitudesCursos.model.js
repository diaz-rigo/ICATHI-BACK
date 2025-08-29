// models/solicitudesCursos.model.js
// const pool = require('../config/db'); // exporta un Pool de 'pg'
// models/reporteAdmin.model.js
const pool = require("../config/database");
const TABLE = 'solicitudes_cursos';

function toCamel(row) {
    if (!row) return row;
    return {
        id: row.id,
        cursoId: row.curso_id,
        docenteId: row.docente_id,
        prioridad: row.prioridad,
        justificacion: row.justificacion,
        estado: row.estado,
        respuestaMensaje: row.respuesta_mensaje,
        evaluadorId: row.evaluador_id,
        fechaRespuesta: row.fecha_respuesta,
        fechaSolicitud: row.fecha_solicitud,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

async function create({ cursoId, docenteId, prioridad, justificacion }) {
    const q = `
    INSERT INTO ${TABLE} (curso_id, docente_id, prioridad, justificacion)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
    const { rows } = await pool.query(q, [cursoId, docenteId, prioridad, justificacion]);
    return toCamel(rows[0]);
}

async function findById(id) {
    const { rows } = await pool.query(`SELECT * FROM ${TABLE} WHERE id = $1;`, [id]);
    return toCamel(rows[0]);
}

/**
 * Listado con filtros + paginación
 * Filters: docenteId, estado, cursoId, prioridad, search (busca en justificación)
 */
async function list({ docenteId, estado, cursoId, prioridad, search, page = 1, pageSize = 20 }) {
    const where = [];
    const params = [];
    let idx = 1;

    if (docenteId) {
        where.push(`docente_id = $${idx++}`);
        params.push(docenteId);
    }
    if (estado) {
        where.push(`estado = $${idx++}`);
        params.push(estado);
    }
    if (cursoId) {
        where.push(`curso_id = $${idx++}`);
        params.push(cursoId);
    }
    if (prioridad) {
        where.push(`prioridad = $${idx++}`);
        params.push(prioridad);
    }
    if (search) {
        where.push(`(justificacion ILIKE $${idx++})`);
        params.push(`%${search}%`);
    }

    const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const offset = (Number(page) - 1) * Number(pageSize);

    const q = `
    SELECT * FROM ${TABLE}
    ${whereSQL}
    ORDER BY created_at DESC
    LIMIT ${Number(pageSize)} OFFSET ${offset}
  `;
    const c = `
    SELECT COUNT(*)::int AS total FROM ${TABLE}
    ${whereSQL}
  `;

    const [rowsRes, countRes] = await Promise.all([
        pool.query(q, params),
        pool.query(c, params),
    ]);

    return {
        data: rowsRes.rows.map(toCamel),
        total: countRes.rows[0].total,
        page: Number(page),
        pageSize: Number(pageSize),
    };
}

/** Actualiza campos generales (prioridad, justificación) */
async function update(id, { prioridad, justificacion }) {
    const sets = [];
    const params = [];
    let idx = 1;

    if (prioridad !== undefined) {
        sets.push(`prioridad = $${idx++}`);
        params.push(prioridad);
    }
    if (justificacion !== undefined) {
        sets.push(`justificacion = $${idx++}`);
        params.push(justificacion);
    }

    // siempre refresca updated_at
    sets.push(`updated_at = now()`);

    const q = `
    UPDATE ${TABLE}
    SET ${sets.join(', ')}
    WHERE id = $${idx}
    RETURNING *;
  `;
    params.push(id);

    const { rows } = await pool.query(q, params);
    return toCamel(rows[0]);
}

/** Cambia el estado y registra respuesta/evaluador/fecha_respuesta */
async function updateEstado(id, { estado, respuestaMensaje, evaluadorId }) {
    const q = `
    UPDATE ${TABLE}
      SET estado = $1,
          respuesta_mensaje = $2,
          evaluador_id = $3,
          fecha_respuesta = now(),
          updated_at = now()
    WHERE id = $4
    RETURNING *;
  `;
    const { rows } = await pool.query(q, [estado, respuestaMensaje || null, evaluadorId || null, id]);
    return toCamel(rows[0]);
}

/** Elimina (soft delete opcional: aquí es hard delete) */
async function remove(id) {
    await pool.query(`DELETE FROM ${TABLE} WHERE id = $1;`, [id]);
    return { success: true };
}

/**
 * Aprobar y (opcional) crear asignación en cursos_docentes
 * Si approveAndAssign = true, inserta en cursos_docentes dentro de la misma transacción
 * paramsAsignacion: { idPlantel } (opcional)
 */
async function aprobarYAsignar(id, { evaluadorId, respuestaMensaje, approveAndAssign = false, paramsAsignacion = {} }) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1) Cambiar estado a Aprobado
        const upQ = `
      UPDATE ${TABLE}
        SET estado = 'Aprobado',
            respuesta_mensaje = $1,
            evaluador_id = $2,
            fecha_respuesta = now(),
            updated_at = now()
      WHERE id = $3
      RETURNING *;
    `;
        const upRes = await client.query(upQ, [respuestaMensaje || null, evaluadorId || null, id]);
        const solicitud = upRes.rows[0];
        if (!solicitud) throw new Error('Solicitud no encontrada');

        let asignacion = null;

        if (approveAndAssign) {
            // 2) Insertar en cursos_docentes (formaliza asignación)
            const { id_plantel: idPlantel } = paramsAsignacion;
            const insertAsign = `
        INSERT INTO cursos_docentes (curso_id, docente_id, fecha_asignacion, estatus, id_plantel)
        VALUES ($1, $2, now(), true, $3)
        RETURNING *;
      `;
            const asignRes = await client.query(insertAsign, [solicitud.curso_id, solicitud.docente_id, idPlantel || null]);
            asignacion = asignRes.rows[0];
        }

        await client.query('COMMIT');
        return { solicitud: toCamel(solicitud), asignacion };
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
}

module.exports = {
    create,
    findById,
    list,
    update,
    updateEstado,
    remove,
    aprobarYAsignar,
};