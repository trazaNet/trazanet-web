const fs = require('fs');
const path = require('path');
const db = require('../config/db');

const initializeDatabase = async () => {
  let client;
  try {
    console.log('Iniciando inicialización de la base de datos...');
    client = await db.getClient();
    
    // Iniciar transacción
    await client.query('BEGIN');

    // Crear tabla de usuarios si no existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        dicose VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20),
        password VARCHAR(255) NOT NULL,
        name VARCHAR(100),
        last_name VARCHAR(100),
        role VARCHAR(20) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Crear tabla de animales si no existe
    await client.query(`
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

    // Verificar si la tabla animales existe antes de crear los índices
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'animales'
      );
    `);

    if (tableExists.rows[0].exists) {
      // Verificar si la columna dispositivo existe
      const columnExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_name = 'animales' 
          AND column_name = 'dispositivo'
        );
      `);

      if (columnExists.rows[0].exists) {
        // Crear índices solo si la tabla y la columna existen
        await client.query(`
          DO $$ 
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_indexes WHERE indexname = 'idx_animales_dispositivo'
            ) THEN
              CREATE INDEX idx_animales_dispositivo ON animales(dispositivo);
            END IF;
            
            IF NOT EXISTS (
              SELECT 1 FROM pg_indexes WHERE indexname = 'idx_animales_propietario'
            ) THEN
              CREATE INDEX idx_animales_propietario ON animales(propietario);
            END IF;
          END $$;
        `);
      }
    }

    // Commit de la transacción
    await client.query('COMMIT');
    console.log('Base de datos inicializada correctamente');
  } catch (error) {
    // Rollback en caso de error
    if (client) {
      await client.query('ROLLBACK');
    }
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
  }
};

module.exports = {
  initializeDatabase
}; 