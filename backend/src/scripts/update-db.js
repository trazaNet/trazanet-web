const db = require('../config/db');
const fs = require('fs').promises;
const path = require('path');

async function updateDatabase() {
  try {
    const sqlFile = path.join(__dirname, 'update-schema.sql');
    const sql = await fs.readFile(sqlFile, 'utf8');
    
    await db.query(sql);
    console.log('Base de datos actualizada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('Error al actualizar la base de datos:', error);
    process.exit(1);
  }
}

updateDatabase(); 