const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { verifyToken } = require('../middleware/auth');
const { getMisAnimales, getAnimalById } = require('../controllers/animales.controller');

// Obtener todos los animales
router.get('/', verifyToken, async (req, res) => {
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
    console.error('Error al obtener animales:', error);
    res.status(500).json({ error: 'Error al obtener los animales' });
  }
});

// Eliminar todos los animales
router.delete('/clear', verifyToken, async (req, res) => {
  try {
    await pool.query('TRUNCATE TABLE animales');
    res.json({ message: 'Todos los registros han sido eliminados' });
  } catch (error) {
    console.error('Error al eliminar los registros:', error);
    res.status(500).json({ error: 'Error al eliminar los registros' });
  }
});

// Obtener mis animales
router.get('/mis-animales', verifyToken, getMisAnimales);

// Obtener un animal por ID
router.get('/:id', verifyToken, getAnimalById);

module.exports = router; 