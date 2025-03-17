const jwt = require('jsonwebtoken');
const db = require('../config/db');

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No se proporcionó token de autenticación' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
};

const isAdmin = async (req, res, next) => {
  try {
    const result = await db.query(
      'SELECT role FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (result.rows[0].role !== 'admin') {
      return res.status(403).json({ message: 'Acceso denegado: se requieren permisos de administrador' });
    }

    next();
  } catch (error) {
    console.error('Error al verificar rol de administrador:', error);
    return res.status(500).json({ message: 'Error en el servidor' });
  }
};

module.exports = {
  verifyToken,
  isAdmin
}; 