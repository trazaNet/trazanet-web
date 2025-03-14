const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'trazanet',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Función para inicializar la base de datos
const initializeDatabase = async () => {
  try {
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

    // Insertar datos de prueba
    await pool.query(`
      INSERT INTO animales (
        dispositivo, raza, cruza, sexo, edad_meses, edad_dias,
        propietario, nombre_propietario, ubicacion, tenedor,
        status_vida, status_trazabilidad, errores,
        fecha_identificacion, fecha_registro
      ) VALUES 
      ('123456', 'Holstein', 'Jersey', 'M', 24, 15, 'PROP001', 'Juan Pérez', 'Canelones', 'TEND001', 'Vivo', 'Activo', 'Ninguno', '2024-03-13', '2024-03-13'),
      ('789012', 'Angus', 'Hereford', 'H', 36, 0, 'PROP002', 'María García', 'Montevideo', 'TEND002', 'Vivo', 'Activo', 'Ninguno', '2024-03-13', '2024-03-13')
      ON CONFLICT DO NOTHING;
    `);

    const sqlPath = path.join(__dirname, 'init.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');
    await pool.query(sqlScript);
    console.log('Base de datos inicializada correctamente');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  }
};

// Inicializar la base de datos
initializeDatabase();

module.exports = {
  query: (text, params) => pool.query(text, params),
}; 