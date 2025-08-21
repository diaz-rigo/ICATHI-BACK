// models/reporteAdmin.model.js
const pool = require("../config/database");
const bcrypt = require('bcrypt');

const ReporteAdminModel = {
        async getDocentesRecientes({
            recentDays = 30,
            search = "",
            estatusId = null,
            limit = 20,
            offset = 0,
            orderBy = "d.created_at",
            orderDir = "DESC",
        }) {
            // Normaliza parámetros
            const dir = String(orderDir).toUpperCase() === "ASC" ? "ASC" : "DESC";

            // Mapa de columnas permitidas para ORDER BY (evita SQL injection y errores)
            const ORDER_COL_MAP = {
                "d.created_at": "d.created_at",
                "d.updated_at": "d.updated_at",
                "d.nombre": "d.nombre",
                "d.apellidos": "d.apellidos",
                "u.username": "u.username",
                "d.estatus_id": "d.estatus_id",
            };
            const orderCol = ORDER_COL_MAP[orderBy] || "d.created_at";

            // Construcción del WHERE
            const vals = [];
            const where = [];

            // Solo docentes vinculados a un usuario
            where.push("d.id_usuario IS NOT NULL");

            // Rango de fechas recientes
            // vals.push(recentDays);
            // where.push(`d.created_at >= (NOW() - ($${vals.length}::int || ' days')::interval)`);

            // Filtro por estatus (si viene)
            if (estatusId !== null && estatusId !== undefined) {
                vals.push(estatusId);
                where.push(`d.estatus_id = $${vals.length}`);
            }

            // Búsqueda
            const rawSearch = (search || "").trim();
            if (rawSearch) {
                const isNumeric = /^[0-9]+$/.test(rawSearch);
                // Para LIKE, usamos pg_trgm si lo habilitas e indexas (ver índices más abajo)
                vals.push(`%${rawSearch}%`);
                const likeIdx = vals.length;

                // Si es numérico, comparamos ids por igualdad (mucho más eficiente y sin castear).
                // Si no, hacemos ILIKE a columnas textuales y (opcionalmente) casteamos a texto solo donde tenga sentido.
                if (isNumeric) {
                    vals.push(parseInt(rawSearch, 10));
                    const idIdx = vals.length;

                    where.push(`(
          d.nombre ILIKE $${likeIdx}
          OR d.apellidos ILIKE $${likeIdx}
          OR d.email ILIKE $${likeIdx}
          OR u.username ILIKE $${likeIdx}
          OR d.num_documento_identificacion ILIKE $${likeIdx}
          OR u.id = $${idIdx}
          OR d.id = $${idIdx}
        )`);
                } else {
                    where.push(`(
          d.nombre ILIKE $${likeIdx}
          OR d.apellidos ILIKE $${likeIdx}
          OR d.email ILIKE $${likeIdx}
          OR u.username ILIKE $${likeIdx}
          OR d.num_documento_identificacion ILIKE $${likeIdx}
        )`);
                }
            }

            // Paginación
            vals.push(limit);
            const limitIdx = vals.length;
            vals.push(offset);
            const offsetIdx = vals.length;

            // Un solo query: traemos filas + total con ventana
            const sql = `
      SELECT
        d.id AS docente_id,
        d.nombre,
        d.apellidos,
        d.email,
        d.telefono,
        d.especialidad,
        d.certificado_profesional,
        d.cedula_profesional,
        d.documento_identificacion,
        d.num_documento_identificacion,
        d.curriculum_url,
        d.created_at AS docente_created_at,
        d.updated_at AS docente_updated_at,
        d.usuario_validador_id,
        d.fecha_validacion,
        d.foto_url,
        d.rol AS docente_rol,
        d.estatus_id,
        e.tipo AS estatus_tipo,
        e.valor AS estatus_valor,
        u.id AS usuario_id,
        u.username AS usuario_username,
        u.email AS usuario_email,
        u.rol AS usuario_rol,
        u.estatus AS usuario_activo,
        u.correo_validado AS usuario_correo_validado,
        u.created_at AS usuario_created_at,
        u.password_hash AS usuario_password_hash,
        COUNT(*) OVER() AS total_count
      FROM docentes d
      INNER JOIN usuarios u ON u.id = d.id_usuario
      LEFT JOIN estatus e ON d.estatus_id = e.id
      ${where.length ? `WHERE ${where.join(" AND ")}` : ""}
      ORDER BY ${orderCol} ${dir}
      LIMIT $${limitIdx} OFFSET $${offsetIdx};
    `;

    const { rows } = await pool.query(sql, vals);

    // Total (mismo valor en todas las filas, tomamos la primera)
    const total = rows.length ? Number(rows[0].total_count) : 0;

    // Verificar contraseñas default para el *lote paginado* (coste controlado)
    // OJO: si tienes muchos usuarios por página, considera mover esto al backend en diferido
    const data = await Promise.all(
      rows.map(async (docente) => {
        const esDefault = docente.usuario_password_hash
          ? await bcrypt.compare("defaultPassword", docente.usuario_password_hash)
          : false;

        const { usuario_password_hash, total_count, ...docenteSinHash } = docente;

        return {
          ...docenteSinHash,
          usuario_password_es_default: esDefault,
        };
      })
    );

    return { data, total, limit, offset };
  },
    // async getDocentesRecientes({
    //     recentDays = 30,
    //     search = "",
    //     estatusId = null,
    //     limit = 20,
    //     offset = 0,
    //     orderBy = "d.created_at",
    //     orderDir = "DESC",
    // }) {
    //     const valores = [];
    //     const where = [];

    //     // Solo docentes con vínculo a un usuario
    //     where.push("d.id_usuario IS NOT NULL");

    //     // Recientes por fecha de creación del docente
    //     valores.push(recentDays);
    //     where.push(`d.created_at >= (NOW() - ($${valores.length}::int || ' days')::interval)`);

    //     // Filtro de búsqueda
    //     if (search && search.trim()) {
    //         valores.push(`%${search.trim()}%`);
    //         const idx = valores.length;
    //         where.push(`(
    //             d.nombre ILIKE $${idx}
    //             OR d.apellidos ILIKE $${idx}
    //             OR d.email ILIKE $${idx}
    //             OR u.username ILIKE $${idx}
    //             OR u.id ILIKE $${idx}
    //             OR u.nombre ILIKE $${idx}
    //             OR d.id ILIKE $${idx}
    //             OR d.num_documento_identificacion ILIKE $${idx}
    //         )`);
    //     }

    //     // Filtro por estatus
    //     if (estatusId) {
    //         valores.push(estatusId);
    //         where.push(`d.estatus_id = $${valores.length}`);
    //     }

    //     // Sanitización básica de orden
    //     const colsPermitidas = new Set([
    //         "d.created_at", "d.updated_at", "d.nombre", "d.apellidos",
    //         "u.username", "d.estatus_id"
    //     ]);
    //     const dirPermitido = orderDir.toUpperCase() === "ASC" ? "ASC" : "DESC";
    //     const colOrden = colsPermitidas.has(orderBy) ? orderBy : "d.created_at";

    //     // Paginación
    //     valores.push(limit);
    //     const idxLimit = valores.length;
    //     valores.push(offset);
    //     const idxOffset = valores.length;

    //     const baseSelect = `
    //         SELECT
    //             d.id AS docente_id,
    //             d.nombre,
    //             d.apellidos,
    //             d.email,
    //             d.telefono,
    //             d.especialidad,
    //             d.certificado_profesional,
    //             d.cedula_profesional,
    //             d.documento_identificacion,
    //             d.num_documento_identificacion,
    //             d.curriculum_url,
    //             d.created_at AS docente_created_at,
    //             d.updated_at AS docente_updated_at,
    //             d.usuario_validador_id,
    //             d.fecha_validacion,
    //             d.foto_url,
    //             d.rol AS docente_rol,
    //             d.estatus_id,
    //             e.tipo AS estatus_tipo,
    //             e.valor AS estatus_valor,
    //             u.id AS usuario_id,
    //             u.username AS usuario_username,
    //             u.email AS usuario_email,
    //             u.rol AS usuario_rol,
    //             u.estatus AS usuario_activo,
    //             u.correo_validado AS usuario_correo_validado,
    //             u.created_at AS usuario_created_at,
    //             u.password_hash AS usuario_password_hash
    //         FROM docentes d
    //         LEFT JOIN estatus e ON d.estatus_id = e.id
    //         INNER JOIN usuarios u ON u.id = d.id_usuario
    //         WHERE ${where.join(" AND ")}
    //         ORDER BY ${colOrden} ${dirPermitido}
    //         LIMIT $${idxLimit} OFFSET $${idxOffset};
    //     `;

    //     const baseCount = `
    //         SELECT COUNT(1) AS total
    //         FROM docentes d
    //         INNER JOIN usuarios u ON u.id = d.id_usuario
    //         ${estatusId ? "LEFT JOIN estatus e ON d.estatus_id = e.id" : ""}
    //         WHERE ${where.join(" AND ")};
    //     `;

    //     const [rows, countRes] = await Promise.all([
    //         pool.query(baseSelect, valores),
    //         pool.query(baseCount, valores.slice(0, valores.length - 2)),
    //     ]);

    //     // Verificar contraseñas default para cada registro
    //     const data = await Promise.all(
    //         rows.rows.map(async(docente) => {
    //             const esDefault = docente.usuario_password_hash ?
    //                 await bcrypt.compare('defaultPassword', docente.usuario_password_hash) :
    //                 false;

    //             // Eliminamos el hash de la respuesta por seguridad
    //             const { usuario_password_hash, ...docenteSinHash } = docente;

    //             return {
    //                 ...docenteSinHash,
    //                 usuario_password_es_default: esDefault
    //             };
    //         })
    //     );

    //     return {
    //         data,
    //         total: Number(countRes.rows[0].total || 0),
    //         limit,
    //         offset,
    //     };
    // },

    async getDocentePorId(docenteId) {
        const q = `
            SELECT
                d.*,
                e.tipo AS estatus_tipo, 
                e.valor AS estatus_valor,
                u.id AS usuario_id, 
                u.username, 
                u.email AS usuario_email, 
                u.rol AS usuario_rol,
                u.estatus AS usuario_activo, 
                u.correo_validado,
                u.password_hash
            FROM docentes d
            LEFT JOIN estatus e ON d.estatus_id = e.id
            LEFT JOIN usuarios u ON u.id = d.id_usuario
            WHERE d.id = $1
        `;
        const r = await pool.query(q, [docenteId]);

        if (!r.rows[0]) return null;

        const docente = r.rows[0];
        const esDefault = docente.password_hash ?
            await bcrypt.compare('defaultPassword', docente.password_hash) :
            false;

        // Eliminamos el hash de la respuesta
        const { password_hash, ...docenteSinHash } = docente;

        return {
            ...docenteSinHash,
            usuario_password_es_default: esDefault
        };
    },

    async actualizarEstatusDocente(docenteId, estatusId, usuarioValidadorId = null) {
        const q = `
            UPDATE docentes
            SET 
                estatus_id = $2,
                usuario_validador_id = COALESCE($3, usuario_validador_id),
                fecha_validacion = CASE WHEN $2 IS NOT NULL THEN NOW() ELSE fecha_validacion END,
                updated_at = NOW()
            WHERE id = $1
            RETURNING *;
        `;
        const r = await pool.query(q, [docenteId, estatusId, usuarioValidadorId]);
        return r.rows[0] || null;
    },

    async actualizarPasswordUsuario(usuarioId, passwordHash) {
        const q = `
            UPDATE usuarios
            SET 
                password_hash = $2,
                updated_at = NOW()
            WHERE id = $1
            RETURNING id, email, username, rol, estatus, correo_validado, updated_at;
        `;
        const r = await pool.query(q, [usuarioId, passwordHash]);
        return r.rows[0] || null;
    },
};

module.exports = ReporteAdminModel;