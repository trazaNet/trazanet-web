const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

// Debug logs
console.log('Environment:', process.env.NODE_ENV);
console.log('Current working directory:', process.cwd());
console.log('DATABASE_URL:', process.env.DATABASE_URL || 'No DATABASE_URL found');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test de conexión
pool.on('connect', () => {
  console.log('Base de datos conectada exitosamente');
});

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err);
});

// Función para probar la conexión
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Conexión de prueba exitosa');
    client.release();
    return true;
  } catch (err) {
    console.error('Error al probar la conexión:', err);
    throw err;
  }
};

// Función para inicializar la base de datos
const initializeDatabase = async () => {
  try {
    // Primero probamos la conexión
    await testConnection();
    
    // Crear tabla de usuarios si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        dicose VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20),
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Crear tabla de animales si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS animales (
        id SERIAL PRIMARY KEY,
        dispositivo VARCHAR(50),
        raza VARCHAR(100),
        cruza VARCHAR(100),
        sexo VARCHAR(10),
        edad_meses INTEGER,
        edad_dias INTEGER,
        propietario VARCHAR(50),
        nombre_propietario VARCHAR(100),
        ubicacion VARCHAR(200),
        tenedor VARCHAR(100),
        status_vida VARCHAR(50),
        status_trazabilidad VARCHAR(50),
        errores TEXT,
        fecha_identificacion DATE,
        fecha_registro DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('Base de datos inicializada correctamente');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  }
};

module.exports = {
  query: (text, params) => pool.query(text, params),
  initializeDatabase
}; 