const pool = require('../config/database'); // Aquí está la conexión con la base de datos







// Obtener docentes por especialidad y con estatus_id = 2
const obtenerDocentesPorEspecialidad =async (id_especialidad) => {
    console.log(id_especialidad)

    try {
        const query = `
        SELECT 
            d.id, 
            d.nombre, 
            d.apellidos,  -- Asegúrate de que sea 'apellidos'
            e.nombre AS especialidad, 
            de.usuario_validador_id,
            de.estatus_id
        FROM docentes d
        JOIN docentes_especialidades de ON d.id = de.docente_id
        JOIN especialidades e ON de.especialidad_id = e.id
        WHERE de.especialidad_id = $1
        AND de.estatus_id = 2;
    `;
        const { rows } = await pool.query(query, [id_especialidad]); // Ejecutar consulta
        return rows; // Devolvemos los resultados para que el controlador pueda manejar la respuesta
    } catch (error) {
        throw new Error('Error al obtener docentes: ' + error.message);
    }
};



// Función para obtener especialidades de un docente por ID
const obtenerEspecialidadesPorDocente = async (docenteId) => {
    try {
        // Ejecutamos la consulta para obtener las especialidades del docente
        const query = `
            SELECT 
                de.id, 
                de.docente_id, 
                de.especialidad_id, 
                es.nombre AS especialidad,
                de.fecha_validacion,
                de.estatus_id,
                est.valor AS estatus
            FROM docentes_especialidades de
            JOIN especialidades es ON de.especialidad_id = es.id
            LEFT JOIN estatus est ON de.estatus_id = est.id
            WHERE de.docente_id = $1
        `;
        
        // Usamos pool.query en lugar de pool.any
        const { rows } = await pool.query(query, [docenteId]); // rows contiene los resultados de la consulta

        return rows; // Devolvemos las filas resultantes
    } catch (error) {
        // Si ocurre un error, lo lanzamos para que el controlador lo maneje
        throw new Error('Error al obtener las especialidades del docente: ' + error.message);
    }
};

// const { enviarCorreo } = require('../config/nodemailer'); // Importa la función para enviar correos

// Función para actualizar el estatus de una especialidad de un docente
const { enviarCorreo } = require('../config/nodemailer'); // Importa la función para enviar correos

// Función para actualizar el estatus de una especialidad de un docente
const actualizarEstatusEspecialidad = async (docenteId, especialidadId, nuevoEstatusId, usuarioValidadorId) => {
    try {
        // Verificar si el registro existe antes de intentar actualizar
        const existeRegistro = `
            SELECT 1 FROM docentes_especialidades
            WHERE docente_id = $1 AND especialidad_id = $2;
        `;
        const { rows: existe } = await pool.query(existeRegistro, [docenteId, especialidadId]);
        if (existe.length === 0) {
            throw new Error('No se encontró el registro para actualizar.');
        }

        // Consulta SQL para actualizar el registro correspondiente
        const query = `
            UPDATE docentes_especialidades
            SET 
                estatus_id = $1, 
                usuario_validador_id = $2, 
                fecha_validacion = NOW(), 
                updated_at = NOW()
            WHERE 
                docente_id = $3 AND 
                especialidad_id = $4
            RETURNING *;
        `;

        // Ejecutamos la consulta
        const { rows } = await pool.query(query, [nuevoEstatusId, usuarioValidadorId, docenteId, especialidadId]);

        // Validamos si se actualizó algún registro
        if (rows.length === 0) {
            throw new Error('No se encontró el registro para actualizar.');
        }

        // Obtener el correo y nombre del docente
        const docenteQuery = `
            SELECT email, nombre
            FROM docentes
            WHERE id = $1;
        `;
        const { rows: docenteData } = await pool.query(docenteQuery, [docenteId]);

        if (docenteData.length === 0) {
            throw new Error('No se encontró el docente para enviar el correo.');
        }

        const { email, nombre } = docenteData[0];

        // Crear el enlace de validación (ajustar según sea necesario)
       
        // Configurar las opciones del correo
        const mailOptions = {
            from: '"ICATHI" <icathi.edu@gmail.com>',
            to: email,
            subject: 'Actualización de tu especialidad',
            html: `
            <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; border-radius: 10px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <div style="background-color: #44509D; padding: 15px 20px; border-radius: 10px 10px 0 0; color: white; text-align: center; border-bottom: 2px solid #f08762;">
                <h1 style="margin: 0; font-size: 24px;">ICATHI</h1>
              </div>
        
              <!-- Logo -->
              <div style="text-align: center; margin: 20px 0;">
                <img src="https://res.cloudinary.com/dgoi24lma/image/upload/v1733759497/ut4pyd5fi9pbsdmhj6n6.png" alt="Logo ICATHI" style="max-width: 150px; height: auto; border-radius: 10px; border: 1px solid #ddd;" />
              </div>
        
              <!-- Body -->
              <div style="padding: 20px; background-color: #ffffff; border-radius: 0 0 10px 10px; box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);">
                <p style="font-size: 16px; color: #333; margin: 0;">Hola <strong>${nombre}</strong>,</p>
                <p style="font-size: 16px; color: #333; line-height: 1.5;">Se ha actualizado el estatus de la especialidad en tu perfil. Puedes revisar el cambio o realizar otras acciones si lo deseas.</p>
                
                <!-- Button -->
     
                
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />
        
                <p style="font-size: 14px; color: #777; text-align: center; margin: 0;">Si no solicitaste esta verificación, puedes ignorar este mensaje.</p>
                <p style="font-size: 14px; color: #777; text-align: center; margin: 5px 0;">Gracias por confiar en nosotros,</p>
                <p style="font-size: 14px; color: #777; text-align: center; font-weight: bold;">Equipo ICATHI</p>
              </div>
        
              <!-- Footer -->
              <div style="padding: 15px; background-color: #f9f9f9; border-top: 1px solid #ddd; text-align: center; border-radius: 0 0 10px 10px;">
                <p style="font-size: 12px; color: #666; margin: 0;">© 2024 ICATHI. Todos los derechos reservados.</p>
                <p style="font-size: 12px; color: #666; margin: 0;">Este es un mensaje automático. Por favor, no respondas a este correo.</p>
              </div>
            </div>
          `
        };

        // Enviar el correo de validación
        await enviarCorreo(mailOptions);

        // Devolvemos el registro actualizado
        return rows[0];
    } catch (error) {
        console.error('Error en actualizarEstatusEspecialidad:', error);
        throw new Error(`Error al actualizar el estatus: ${error.message}`);
    }
};


module.exports = {
    actualizarEstatusEspecialidad,
    obtenerEspecialidadesPorDocente,obtenerDocentesPorEspecialidad // Exportamos la función
};
