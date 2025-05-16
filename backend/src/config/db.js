const { Pool } = require('pg');
require('dotenv').config();

// Debug logs
console.log('=== DATABASE CONFIGURATION ===');
console.log('Environment:', process.env.NODE_ENV);
console.log('Database URL:', process.env.DATABASE_URL ? 'Found' : 'Not found');

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is required');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Necesario para Supabase
  },
  // Configuración específica para Supabase
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  application_name: 'trazanet_backend'
});

// Connection event handlers
pool.on('connect', () => {
  console.log('New client connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
  // No cerramos el proceso en caso de error para permitir reintentos
  console.error('Error details:', {
    message: err.message,
    code: err.code,
    detail: err.detail
  });
});

pool.on('remove', () => {
  console.log('Client removed from pool');
});

const testConnection = async () => {
  let client;
  try {
    console.log('Testing database connection...');
    client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('Database connection successful:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  } finally {
    if (client) {
      client.release();
    }
  }
};

const initializeDatabase = async () => {
  try {
    console.log('Iniciando inicialización de la base de datos...');
    const isConnected = await testConnection();
    if (!isConnected) {
      throw new Error('No se pudo conectar a la base de datos');
    }
    console.log('Conexión a la base de datos establecida correctamente');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  }
};

const getClient = async () => {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    console.error('Error getting database client:', error);
    throw new Error('Database connection error');
  }
};

module.exports = {
  pool,
  getClient,
  testConnection,
  initializeDatabase
}; 