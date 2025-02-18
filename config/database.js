const { Pool } = require('pg');

// // Configuración del pool de conexiones
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://iicathi:IukFwhv3roNxG7uwUMgPQawmWNEaBpIc@dpg-cupv77lumphs73ebghs0-a.oregon-postgres.render.com/iicathi',
  ssl: {
    rejectUnauthorized: false, // Para conexiones SSL a servicios en la nube como Render
  },
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
