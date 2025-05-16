const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const register = async (req, res) => {
  const { dicose, email, phone, password, name, lastName } = req.body;
  let client;

  try {
    client = await db.getClient();

    // Verificar si el usuario ya existe
    const userExists = await client.query(
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
    const result = await client.query(
      'INSERT INTO users (dicose, email, phone, password, name, last_name, role) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, dicose, email, phone, name, last_name, role',
      [dicose, email, phone, hashedPassword, name, lastName, 'user']
    );

    // Generar token JWT
    const token = jwt.sign(
      { id: result.rows[0].id, role: result.rows[0].role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    res.status(201).json({
      user: result.rows[0],
      token
    });
  } catch (error) {
    console.error('Error en el registro:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      constraint: error.constraint
    });
    
    if (error.constraint === 'users_email_key') {
      return res.status(409).json({
        message: 'El email ya está registrado'
      });
    }
    
    if (error.constraint === 'users_dicose_key') {
      return res.status(409).json({
        message: 'El DICOSE ya está registrado'
      });
    }

    res.status(500).json({
      message: 'Error en el servidor',
      detail: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};

const login = async (req, res) => {
  console.log('=== INICIO DEL PROCESO DE LOGIN ===');
  console.log('Headers recibidos:', req.headers);
  console.log('Cuerpo de la solicitud:', req.body);
  
  const { email, password } = req.body;
  let client;

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email y contraseña son requeridos'
    });
  }

  try {
    console.log('Intentando obtener cliente de la base de datos...');
    client = await db.getClient();
    
    console.log('Buscando usuario con email:', email);
    const result = await client.query(
      'SELECT id, email, password, name, last_name, role, dicose, phone FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      console.log('Usuario no encontrado');
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }

    const user = result.rows[0];
    console.log('Usuario encontrado:', { id: user.id, email: user.email });

    if (!user.password) {
      console.error('El usuario no tiene contraseña almacenada');
      return res.status(500).json({
        message: 'Error en la configuración del usuario'
      });
    }

    console.log('Verificando contraseña...');
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      console.log('Contraseña inválida');
      return res.status(401).json({
        message: 'Credenciales inválidas'
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET no está configurado');
      return res.status(500).json({
        message: 'Error en la configuración del servidor'
      });
    }

    console.log('Contraseña válida, generando token...');
    const token = jwt.sign(
      { 
        id: user.id,
        role: user.role || 'user'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    
    console.log('Login exitoso para el usuario:', email);
    res.json({
      user: {
        ...userWithoutPassword,
        lastName: user.last_name
      },
      token
    });
  } catch (error) {
    console.error('Error en el proceso de login:', {
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

    if (error.message === 'Database connection error') {
      return res.status(503).json({
        message: 'Error de conexión con la base de datos'
      });
    }

    res.status(500).json({
      message: 'Error en el servidor',
      detail: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        code: error.code
      } : undefined
    });
  } finally {
    if (client) {
      client.release();
    }
  }
};

module.exports = {
  register,
  login
}; 