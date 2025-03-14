const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

async function initializeDatabase() {
  try {
    // Leer el archivo schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // Ejecutar el schema
    await pool.query(schema);
    console.log('Base de datos inicializada correctamente');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
    throw error;
  }
}

module.exports = initializeDatabase; 