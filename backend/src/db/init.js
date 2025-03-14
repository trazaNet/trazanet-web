const fs = require('fs');
const path = require('path');
const { query, initializeDatabase: initDb } = require('../config/db');

async function initializeDatabase() {
  try {
    console.log('Iniciando inicialización de la base de datos...');
    
    // Primero inicializamos las tablas básicas
    await initDb();
    
    // Luego ejecutamos scripts adicionales si existen
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('Ejecutando scripts adicionales...');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await query(schema);
      console.log('Scripts adicionales ejecutados correctamente');
    }

    console.log('Base de datos inicializada completamente');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  }
}

module.exports = initializeDatabase; 