const jwt = require('jsonwebtoken');
const db = require('../config/db');

const verifyToken = async (req, res, next) => {
  try {
    console.log('=== INICIO DE VERIFICACIÓN DE TOKEN ===');
    console.log('Headers recibidos:', req.headers);
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      console.log('No se encontró header de autorización');
      return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('Token no encontrado en el header');
      return res.status(401).json({ message: 'Formato de token inválido' });
    }

    console.log('Token recibido:', token.substring(0, 20) + '...');
    
    // Verificar que JWT_SECRET está definido
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET no está definido en las variables de entorno');
      return res.status(500).json({ message: 'Error de configuración del servidor' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decodificado:', decoded);
      req.user = decoded;

      // Verificar si el usuario aún existe en la base de datos
      let client;
      try {
        client = await db.getClient();
        console.log('Verificando usuario en BD con ID:', decoded.id);
        const result = await client.query('SELECT id, role FROM users WHERE id = $1', [decoded.id]);
        
        if (result.rows.length === 0) {
          console.log('Usuario no encontrado en BD');
          return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        console.log('Usuario encontrado en BD:', result.rows[0]);
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
    } catch (jwtError) {
      console.error('Error al verificar JWT:', {
        name: jwtError.name,
        message: jwtError.message,
        expiredAt: jwtError.expiredAt
      });
      
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expirado' });
      }
      
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Token inválido' });
      }
      
      if (jwtError.name === 'NotBeforeError') {
        return res.status(401).json({ message: 'Token no activo' });
      }
      
      return res.status(401).json({ message: 'Error al verificar token' });
    }
  } catch (error) {
    console.error('Error general en verificación de token:', error);
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