const bcrypt = require('bcrypt');
const pool = require('../config/database');
const { enviarCorreo } = require('../config/nodemailer'); // Importa la función para enviar correos

const PlantelesModel = {

  async create(plantel) {
    const saltRounds = 10;
    const password = generateRandomPassword();
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const username = generateUsername(plantel.nombre);

    try {
      // Insertar el usuario primero
      const userQuery = `
        INSERT INTO usuarios (
            nombre, apellidos, email, telefono, username, password_hash, rol, estatus
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`;
      
      const userValues = [
        plantel.director, '', plantel.email, plantel.telefono || null,
        username, hashedPassword, 'PLANTEL', true
      ];
      
      const userResult = await pool.query(userQuery, userValues);
      const userId = userResult.rows[0].id;

      // Insertar el plantel con el id del usuario
      const plantelQuery = `
        INSERT INTO planteles (
            nombre, direccion, telefono, email, director, capacidad_alumnos,
            estatus, estado, municipio, password, id_usuario
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`;
      
      const plantelValues = [
        plantel.nombre, plantel.direccion, plantel.telefono || null, plantel.email || null,
        plantel.director, plantel.capacidad_alumnos, plantel.estatus !== undefined ? plantel.estatus : true,
        plantel.estado, plantel.municipio, hashedPassword, userId
      ];
      
      const plantelResult = await pool.query(plantelQuery, plantelValues);
      
      // Configuración del correo
      const mailOptions = {
        from: '"ICATHI" <icathi.edu@gmail.com>',
        to: plantel.email, // Se usa el email del plantel correctamente
        subject: 'Credenciales de acceso - ICATHI',
        html: `
          <div style="font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; border-radius: 10px; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);">
            <div style="background-color: #44509D; padding: 15px 20px; border-radius: 10px 10px 0 0; color: white; text-align: center; border-bottom: 2px solid #f08762;">
              <h1 style="margin: 0; font-size: 24px;">ICATHI</h1>
            </div>
      
            <div style="text-align: center; margin: 20px 0;">
              <img src="https://res.cloudinary.com/dgoi24lma/image/upload/v1733759497/ut4pyd5fi9pbsdmhj6n6.png" alt="Logo ICATHI" style="max-width: 150px; height: auto; border-radius: 10px; border: 1px solid #ddd;" />
            </div>
      
            <p style="text-align: center; font-size: 16px; color: #333;">
              Hola <strong>${plantel.director}</strong>,<br>
              Se ha creado tu cuenta en <strong>ICATHI</strong>. Puedes acceder con las siguientes credenciales:
            </p>
      
            <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; border: 1px solid #ddd; text-align: center;">
              <p style="font-size: 16px; margin: 10px 0;"><strong>Correo:</strong> ${plantel.email}</p>
              <p style="font-size: 16px; margin: 10px 0;"><strong>Contraseña:</strong> ${password}</p>
            </div>
      
            <p style="text-align: center; margin-top: 20px; font-size: 14px;">
              Para mayor seguridad, te recomendamos cambiar tu contraseña después de iniciar sesión.
            </p>
      
            <p style="text-align: center; margin-top: 20px;">
              <a href="https://icathi.vercel.app/public/login" style="background-color: #44509D; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Iniciar sesión
              </a>
            </p>
      
            <div style="padding: 15px; background-color: #f9f9f9; border-top: 1px solid #ddd; text-align: center; border-radius: 0 0 10px 10px;">
              <p style="font-size: 12px; color: #666; margin: 0;">© 2024 ICATHI. Todos los derechos reservados.</p>
              <p style="font-size: 12px; color: #666; margin: 0;">Este es un mensaje automático. Por favor, no respondas a este correo.</p>
            </div>
          </div>
        `,
      };
      
  
      // Enviar el correo de credenciales
      await enviarCorreo(mailOptions);

      return plantelResult.rows[0];

    } catch (error) {
      console.error('Error al crear el plantel:', error);
      throw error;
    }
  },

  async getAll() {
    const query = 'SELECT * FROM planteles';
    const { rows } = await pool.query(query);
    return rows;
  },

  async getById(id) {
    const query = 'SELECT * FROM planteles WHERE id = $1';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },

  // async create(plantel) {
  //   const saltRounds = 10;

  //   // Generar hash de la contraseña si se proporciona
  //   const hashedPassword = plantel.password
  //     ? await bcrypt.hash(plantel.password, saltRounds)
  //     : null;

  //   const query = `
  //     INSERT INTO planteles (
  //       nombre, direccion, telefono, email, director, capacidad_alumnos, 
  //       estatus,  estado, municipio, password
  //     )
  //     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
  //   const values = [
  //     plantel.nombre,
  //     plantel.direccion,
  //     plantel.telefono || null,
  //     plantel.email || null,
  //     plantel.director,
  //     plantel.capacidad_alumnos,
  //     plantel.estatus || true,
  //     plantel.estado,
  //     plantel.municipio,
  //     hashedPassword, // Aquí pasa el hash directamente como contraseña
  //   ];
  //   const { rows } = await pool.query(query, values);
  //   return rows[0];
  // },

  async update(id, plantel) {
    const saltRounds = 10;

    // Generar hash de la nueva contraseña si se proporciona
    const hashedPassword = plantel.password
      ? await bcrypt.hash(plantel.password, saltRounds)
      : null;

    const query = `
      UPDATE planteles
      SET nombre = $1,
          direccion = $2,
          telefono = $3,
          email = $4,
          director = $5,
          capacidad_alumnos = $6,
          estatus = $7,
          usuario_gestor_id = $8,
          estado = $9,
          municipio = $10,
          password = COALESCE($11, password),
          updated_at = NOW()
      WHERE id = $12 RETURNING *`;
    const values = [
      plantel.nombre,
      plantel.direccion,
      plantel.telefono || null,
      plantel.email || null,
      plantel.director,
      plantel.capacidad_alumnos,
      plantel.estatus || true,
      plantel.usuario_gestor_id || null,
      plantel.estado,
      plantel.municipio,
      hashedPassword, // Aquí también pasa el hash directamente
      id,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  },

  async delete(id) {
    const query = 'DELETE FROM planteles WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [id]);
    return rows[0];
  },


  async getPlantelDetails(plantelId) {
    const query = `
      SELECT 
          p.id AS plantel_id,
          COUNT(DISTINCT ac.curso_id) AS total_cursos,
          COUNT(DISTINCT ac.alumno_id) AS total_alumnos
      FROM 
          planteles_cursos pc
      LEFT JOIN 
          alumnos_cursos ac ON pc.plantel_id = ac.plantel_id AND pc.curso_id = ac.curso_id
      JOIN 
          planteles p ON p.id = pc.plantel_id
      WHERE 
          p.id = $1
      GROUP BY 
          p.id;
    `;
    const { rows } = await pool.query(query, [plantelId]);
    return rows[0]; // Retornar un solo registro, ya que es específico para un plantel.
  },
  async getCursosByPlantelId(plantelId) {
    const query = `
      SELECT 
          c.id AS curso_id,
          c.nombre AS curso_nombre,
          c.descripcion AS curso_descripcion,
          c.duracion_horas,
          c.nivel,
          c.costo,
          c.requisitos,
          pc.cupo_maximo,
          pc.fecha_inicio,
          pc.fecha_fin,
          pc.horario,
          pc.estatus
      FROM 
          planteles_cursos pc
      JOIN 
          cursos c ON pc.curso_id = c.id
      WHERE 
          pc.plantel_id = $1;
    `;
    const values = [plantelId];
    const { rows } = await pool.query(query, values);
    return rows;
  },
};

// Funciones auxiliares
function generateRandomPassword() {
  return Math.random().toString(36).slice(-8) + "A1"; // Asegura un mínimo de complejidad
}

function generateUsername(nombre) {
  return nombre.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000);
}

async function sendEmail(to, username, password) {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { 
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS 
      }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: 'Credenciales de acceso',
      text: `Tu usuario es: ${username}\nTu contraseña es: ${password}`
    };
    
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error al enviar el correo:', error);
  }
}






module.exports = PlantelesModel;
