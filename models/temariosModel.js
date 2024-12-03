const pool = require('../config/database');

const TemariosModel = {
    async getAll() {
        const query = 'SELECT * FROM temarios';
        const { rows } = await pool.query(query);
        return rows;
    },

    async getById(id) {
        const query = 'SELECT * FROM temarios WHERE id = \$1';
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    },

    async create(temario) {
        const query = `
            INSERT INTO temarios (nombre_tema, actividades, material, criterios_evaluacion, bibliografia, curso_id)
            VALUES (\$1, \$2, \$3, \$4, \$5, \$6) RETURNING *`;
        const values = [
            temario.nombre_tema,
            temario.actividades || null,
            temario.material || null,
            temario.criterios_evaluacion || null,
            temario.bibliografia || null,
            temario.curso_id
        ];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    async update(id, temario) {
        const query = `
            UPDATE temarios
            SET nombre_tema = \$1,
                actividades = \$2,
                material = \$3,
                criterios_evaluacion = \$4,
                bibliografia = \$5,
                curso_id = \$6
            WHERE id = \$7 RETURNING *`;
        const values = [
            temario.nombre_tema,
            temario.actividades || null,
            temario.material || null,
            temario.criterios_evaluacion || null,
            temario.bibliografia || null,
            temario.curso_id,
            id
        ];
        const { rows } = await pool.query(query, values);
        return rows[0];
    },

    async delete(id) {
        const query = 'DELETE FROM temarios WHERE id = \$1 RETURNING *';
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }
};

module.exports = TemariosModel;