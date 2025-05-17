const XLSX = require('xlsx');
const { pool } = require('../config/db');

const uploadExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ningún archivo' });
    }

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(firstSheet, { raw: true });

    // Insertar los datos en la base de datos sin truncar la tabla
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

      // Verificar si el dispositivo ya existe
      const existingRecord = await pool.query(
        'SELECT dispositivo FROM animales WHERE dispositivo = $1',
        [row.dispositivo.toString()]
      );

      // Si el dispositivo no existe, insertar el nuevo registro
      if (existingRecord.rows.length === 0) {
        await pool.query(
          `INSERT INTO animales (
            dispositivo, raza, cruza, sexo, edad_meses, edad_dias,
            propietario, nombre_propietario, ubicacion, tenedor,
            status_vida, status_trazabilidad, errores,
            fecha_identificacion, fecha_registro
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
          [
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

    // Devolver los datos actualizados
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
        TO_CHAR(fecha_registro, 'YYYY-MM-DD') as "fechaRegistro",
        TO_CHAR(created_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "created_at"
      FROM animales
      WHERE dispositivo IS NOT NULL AND propietario IS NOT NULL
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error al procesar el archivo Excel:', error);
    res.status(500).json({ error: 'Error al procesar el archivo Excel' });
  }
};

const getExcelData = async (req, res) => {
  try {
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
        TO_CHAR(fecha_registro, 'YYYY-MM-DD') as "fechaRegistro",
        TO_CHAR(created_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as "created_at"
      FROM animales
      WHERE dispositivo IS NOT NULL AND propietario IS NOT NULL
      ORDER BY id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener datos:', error);
    res.status(500).json({ error: 'Error al obtener los datos' });
  }
};

module.exports = {
  uploadExcel,
  getExcelData
}; 