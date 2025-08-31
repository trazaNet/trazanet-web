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

// Parse connection string to get individual components
const connectionString = process.env.DATABASE_URL;

// Log connection details (without password)
const connectionDetails = new URL(connectionString);
console.log('Connection details:', {
  host: connectionDetails.hostname,
  port: connectionDetails.port,
  database: connectionDetails.pathname.slice(1),
  user: connectionDetails.username
});

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  },
  // Configuración optimizada para Supabase
  max: 5,
  min: 1,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  application_name: 'trazanet_backend',
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
});

// Connection event handlers
pool.on('connect', (client) => {
  console.log('New client connected to PostgreSQL');
  client.on('error', (err) => {
    console.error('Error en cliente PostgreSQL:', err);
  });
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
  console.error('Error details:', {
    message: err.message,
    code: err.code,
    detail: err.detail,
    hint: err.hint
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
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint
    });
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
  let retries = 3;
  let lastError;
  
  while (retries > 0) {
    try {
      const client = await pool.connect();
      return client;
    } catch (error) {
      lastError = error;
      console.error(`Error getting database client (${retries} retries left):`, error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint
      });
      retries--;
      if (retries === 0) {
        console.error('All retry attempts failed. Last error:', lastError);
        throw new Error('Database connection error after multiple retries');
      }
      // Esperar tiempo exponencial entre reintentos
      const waitTime = Math.min(1000 * Math.pow(2, 3 - retries), 5000);
      console.log(`Waiting ${waitTime}ms before next retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

module.exports = {
  pool,
  getClient,
  testConnection,
  initializeDatabase
}; 