const express = require('express');
const router = express.Router();
const multer = require('multer');
const { verifyToken } = require('../middleware/auth');
const pool = require('../config/db');
const XLSX = require('xlsx');

// Configurar multer para manejar la carga de archivos
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Ruta para subir archivo Excel
router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha proporcionado ningún archivo' });
    }

    // Leer el archivo Excel
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(firstSheet, { raw: true });

    // Insertar los datos en la base de datos
    for (const row of data) {
      // Validar que los campos requeridos existan
      if (!row.dispositivo || !row.propietario) {
        continue; // Saltar registros sin dispositivo o propietario
      }

      // Convertir fechas de Excel a formato PostgreSQL
      const fechaIdentificacion = row.fechaIdentificacion ? 
        new Date(Math.round((row.fechaIdentificacion - 25569) * 86400 * 1000)) : null;
      const fechaRegistro = row.fechaRegistro ? 
        new Date(Math.round((row.fechaRegistro - 25569) * 86400 * 1000)) : null;

      // Verificar si el dispositivo ya existe para este usuario
      const existingRecord = await pool.query(
        'SELECT dispositivo FROM animales WHERE dispositivo = $1 AND user_id = $2',
        [row.dispositivo.toString(), req.user.id]
      );

      // Si el dispositivo no existe, insertar el nuevo registro
      if (existingRecord.rows.length === 0) {
        await pool.query(
          `INSERT INTO animales (
            user_id, dispositivo, raza, cruza, sexo, edad_meses, edad_dias,
            propietario, nombre_propietario, ubicacion, tenedor,
            status_vida, status_trazabilidad, errores,
            fecha_identificacion, fecha_registro
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
          [
            req.user.id,
            row.dispositivo.toString(),
            row.raza?.toString() || '',
            row.cruza?.toString() || '',
            row.sexo?.toString() || '',
            parseInt(row.edadMeses) || 0,
            parseInt(row.edadDias) || 0,
            row.propietario.toString(),
            row.nombrePropietario?.toString() || '',
            row.ubicacion?.toString() || '',
            row.tenedor?.toString() || '',
            row.statusVida?.toString() || '',
            row.statusTrazabilidad?.toString() || '',
            row.errores?.toString() || '',
            fechaIdentificacion,
            fechaRegistro
          ]
        );
      }
    }

    res.json({ message: 'Archivo procesado exitosamente' });
  } catch (error) {
    console.error('Error al procesar el archivo:', error);
    res.status(500).json({ error: 'Error al procesar el archivo' });
  }
});

// Ruta para obtener datos
router.get('/data', verifyToken, async (req, res) => {
  try {
    console.log('Obteniendo datos para usuario:', req.user.id);
    const result = await pool.query(`
      SELECT 
        id,
        dispositivo,
        raza,
        cruza,
        sexo,
        edad_meses as "edadMeses",
        edad_dias as "edadDias",
        propietario,
        nombre_propietario as "nombrePropietario",
        ubicacion,
        tenedor,
        status_vida as "statusVida",
        status_trazabilidad as "statusTrazabilidad",
        errores,
        TO_CHAR(fecha_identificacion, 'YYYY-MM-DD') as "fechaIdentificacion",
        TO_CHAR(fecha_registro, 'YYYY-MM-DD') as "fechaRegistro"
      FROM animales
      WHERE user_id = $1
      ORDER BY id DESC
    `, [req.user.id]);
    
    console.log('Datos encontrados:', result.rows.length);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ error: 'Error al obtener los datos' });
  }
});

// Ruta para limpiar datos
router.delete('/clear', verifyToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM animales WHERE user_id = $1', [req.user.id]);
    res.json({ message: 'Datos eliminados exitosamente' });
  } catch (error) {
    console.error('Error al limpiar datos:', error);
    res.status(500).json({ error: 'Error al limpiar los datos' });
  }
});

module.exports = router; 