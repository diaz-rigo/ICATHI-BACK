const { Pool } = require('pg');

// // Configuración del pool de conexiones
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL || 'postgresql://icathi:Cz6YjxCSPnPVDXWxfbOE4XBqRv71StU6@dpg-ct4eqi5umphs73e5ohi0-a.oregon-postgres.render.com/icathi',
//   ssl: {
//     rejectUnauthorized: false, // Para conexiones SSL a servicios en la nube como Render
//   },
// });
const pool = new Pool({
  user: process.env.DB_USER || "postgres",  
  host: process.env.DB_HOST || "201.116.27.119", // Dirección del servidor
  database: process.env.DB_NAME || "icathi", // Nombre de la BD
  password: process.env.DB_PASSWORD || "postgres", // Contraseña
  port: process.env.DB_PORT || 5432, // Puerto de PostgreSQL (por defecto es 5432)
  ssl: false,  // Asegúrate de que sea false si no usas SSL

});
// Verificar conexión al inicializar
pool.connect()
  .then(client => {
    console.log('✅ Conexión exitosa a la base de datos PostgreSQL');
    client.release(); // Liberar el cliente para que esté disponible en el pool
  })
  .catch(err => {
    console.error('❌ Error al conectar a la base de datos PostgreSQL:', err.message);
  });

module.exports = pool;
