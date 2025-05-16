const db = require('../config/db');

const getMisAnimales = async (req, res) => {
  let client;
  try {
    client = await db.getClient();
    
    const result = await client.query(`
      SELECT 
        id,
        dispositivo,
        raza,
        cruza,
        sexo,
        edad_meses,
        edad_dias,
        propietario,
        nombre_propietario,
        ubicacion,
        tenedor,
        status_vida,
        status_trazabilidad,
        errores,
        TO_CHAR(fecha_identificacion, 'YYYY-MM-DD') as fecha_identificacion,
        TO_CHAR(fecha_registro, 'YYYY-MM-DD') as fecha_registro,
        TO_CHAR(created_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as created_at
      FROM animales
      WHERE propietario = $1
      ORDER BY created_at DESC
    `, [req.user.dicose]);

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener animales:', error);
    res.status(500).json({ message: 'Error al obtener los animales' });
  } finally {
    if (client) {
      client.release();
    }
  }
};

const getAnimalById = async (req, res) => {
  const { id } = req.params;
  let client;
  try {
    client = await db.getClient();
    
    const result = await client.query(`
      SELECT 
        id,
        dispositivo,
        raza,
        cruza,
        sexo,
        edad_meses,
        edad_dias,
        propietario,
        nombre_propietario,
        ubicacion,
        tenedor,
        status_vida,
        status_trazabilidad,
        errores,
        TO_CHAR(fecha_identificacion, 'YYYY-MM-DD') as fecha_identificacion,
        TO_CHAR(fecha_registro, 'YYYY-MM-DD') as fecha_registro,
        TO_CHAR(created_at, 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as created_at
      FROM animales
      WHERE id = $1 AND propietario = $2
    `, [id, req.user.dicose]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Animal no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener animal:', error);
    res.status(500).json({ message: 'Error al obtener el animal' });
  } finally {
    if (client) {
      client.release();
    }
  }
};

module.exports = {
  getMisAnimales,
  getAnimalById
}; 