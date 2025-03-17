const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const register = async (req, res) => {
  const { dicose, email, phone, password, name, lastName } = req.body;

  try {
    // Verificar si el usuario ya existe
    const userExists = await db.query(
      'SELECT * FROM users WHERE email = $1 OR dicose = $2',
      [email, dicose]
    );

    if (userExists.rows.length > 0) {
      return res.status(409).json({
        message: 'El usuario ya existe'
      });
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear el usuario
    const result = await db.query(
      'INSERT INTO users (dicose, email, phone, password, name, last_name, role) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, dicose, email, phone, name, last_name, role',
      [dicose, email, phone, hashedPassword, name, lastName, 'user']
    );

    // Generar token JWT
    const token = jwt.sign(
      { id: result.rows[0].id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    res.status(201).json({
      user: result.rows[0],
      token
    });
  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({
      message: 'Error en el servidor'
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  // Verificar credenciales de desarrollo
  if (email === 'dev123' && password === 'dev123') {
    const token = jwt.sign(
      { id: 0 },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    return res.json({
      user: {
        id: 0,
        dicose: 'DEV',
        email: 'dev123',
        phone: '000000000'
      },
      token
    });
  }

  try {
    // Buscar usuario
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }

    const user = result.rows[0];

    // Verificar contraseña
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({
        message: 'Credenciales inválidas'
      });
    }

    // Generar token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    res.json({
      user: {
        id: user.id,
        dicose: user.dicose,
        email: user.email,
        phone: user.phone,
        name: user.name,
        lastName: user.last_name,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({
      message: 'Error en el servidor'
    });
  }
};

module.exports = {
  register,
  login
}; 