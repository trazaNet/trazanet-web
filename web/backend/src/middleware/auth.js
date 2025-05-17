const jwt = require('jsonwebtoken');
const db = require('../config/db');

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Formato de token inválido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    // Verificar si el usuario aún existe en la base de datos
    let client;
    try {
      client = await db.getClient();
      const result = await client.query('SELECT id, role FROM users WHERE id = $1', [decoded.id]);
      
      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Usuario no encontrado' });
      }

      req.user.role = result.rows[0].role;
      next();
    } catch (error) {
      console.error('Error al verificar usuario en BD:', error);
      res.status(500).json({ message: 'Error al verificar autenticación' });
    } finally {
      if (client) {
        client.release();
      }
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Token inválido' });
    }
    console.error('Error en verificación de token:', error);
    res.status(500).json({ message: 'Error al verificar autenticación' });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado - Se requiere rol de administrador' });
    }

    next();
  } catch (error) {
    console.error('Error en verificación de admin:', error);
    res.status(500).json({ message: 'Error al verificar permisos' });
  }
};

module.exports = {
  verifyToken,
  isAdmin
}; 