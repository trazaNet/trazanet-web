const { Pool } = require('pg');
require('dotenv').config();

async function checkTable() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false
  });

  try {
    console.log('Conectando a la base de datos...');
    const client = await pool.connect();
    
    console.log('Consultando estructura de la tabla inversiones...');
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'inversiones'
      ORDER BY ordinal_position;
    `);
    
    console.log('Estructura de la tabla inversiones:');
    console.table(result.rows);
    
    client.release();
  } catch (error) {
    console.error('Error al consultar la estructura de la tabla:', error);
  } finally {
    pool.end();
  }
}

checkTable(); 