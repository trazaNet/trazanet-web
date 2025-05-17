const { query } = require('../config/db');

const inversionesController = {
  // Obtener todas las inversiones
  getAllInversiones: async (req, res) => {
    try {
      console.log('Intentando obtener todas las inversiones...');
      const result = await query('SELECT * FROM inversiones ORDER BY fecha_inicio DESC');
      console.log('Inversiones obtenidas:', result.rows);
      res.json(result.rows);
    } catch (error) {
      console.error('Error detallado al obtener inversiones:', {
        message: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint,
        position: error.position,
        where: error.where,
        schema: error.schema,
        table: error.table,
        column: error.column,
        dataType: error.dataType,
        constraint: error.constraint
      });
      res.status(500).json({ message: 'Error al obtener las inversiones', error: error.message });
    }
  },

  // Crear una nueva inversión
  createInversion: async (req, res) => {
    const { tipo, descripcion, fechaInicio, fechaFin, costo } = req.body;
    try {
      console.log('Intentando crear inversión con datos:', { tipo, descripcion, fechaInicio, fechaFin, costo });
      const result = await query(
        'INSERT INTO inversiones (tipo, descripcion, fecha_inicio, fecha_fin, costo) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [tipo, descripcion, fechaInicio, fechaFin, costo]
      );
      console.log('Inversión creada:', result.rows[0]);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error detallado al crear inversión:', {
        message: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint,
        position: error.position,
        where: error.where,
        schema: error.schema,
        table: error.table,
        column: error.column,
        dataType: error.dataType,
        constraint: error.constraint
      });
      res.status(500).json({ message: 'Error al crear la inversión', error: error.message });
    }
  },

  // Actualizar una inversión
  updateInversion: async (req, res) => {
    const { id } = req.params;
    const { tipo, descripcion, fechaInicio, fechaFin, costo } = req.body;
    try {
      console.log('Intentando actualizar inversión:', { id, tipo, descripcion, fechaInicio, fechaFin, costo });
      const result = await query(
        'UPDATE inversiones SET tipo = $1, descripcion = $2, fecha_inicio = $3, fecha_fin = $4, costo = $5 WHERE id = $6 RETURNING *',
        [tipo, descripcion, fechaInicio, fechaFin, costo, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Inversión no encontrada' });
      }
      console.log('Inversión actualizada:', result.rows[0]);
      res.json(result.rows[0]);
    } catch (error) {
      console.error('Error detallado al actualizar inversión:', {
        message: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint,
        position: error.position,
        where: error.where,
        schema: error.schema,
        table: error.table,
        column: error.column,
        dataType: error.dataType,
        constraint: error.constraint
      });
      res.status(500).json({ message: 'Error al actualizar la inversión', error: error.message });
    }
  },

  // Eliminar una inversión
  deleteInversion: async (req, res) => {
    const { id } = req.params;
    try {
      console.log('Intentando eliminar inversión con id:', id);
      const result = await query('DELETE FROM inversiones WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Inversión no encontrada' });
      }
      console.log('Inversión eliminada:', result.rows[0]);
      res.json({ message: 'Inversión eliminada correctamente' });
    } catch (error) {
      console.error('Error detallado al eliminar inversión:', {
        message: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint,
        position: error.position,
        where: error.where,
        schema: error.schema,
        table: error.table,
        column: error.column,
        dataType: error.dataType,
        constraint: error.constraint
      });
      res.status(500).json({ message: 'Error al eliminar la inversión', error: error.message });
    }
  }
};

module.exports = inversionesController; 