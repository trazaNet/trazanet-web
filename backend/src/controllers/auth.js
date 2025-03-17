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
      { id: result.rows[0].id, role: result.rows[0].role },
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
  console.log('=== INICIO DEL PROCESO DE LOGIN ===');
  console.log('Ambiente:', process.env.NODE_ENV);
  console.log('Database URL:', process.env.DATABASE_URL);
  
  const { email, password } = req.body;
  console.log('Email recibido:', email);

  try {
    console.log('Intentando conectar a la base de datos...');
    // Verificar conexión a la base de datos
    await db.query('SELECT NOW()');
    console.log('Conexión a la base de datos exitosa');

    console.log('Buscando usuario...');
    // Buscar usuario
    const result = await db.query(
      'SELECT id, email, password, name, last_name, role, dicose, phone FROM users WHERE email = $1',
      [email]
    );

    console.log('Resultado de la búsqueda:', {
      encontrado: result.rows.length > 0,
      campos: result.rows.length > 0 ? Object.keys(result.rows[0]) : [],
      tienePassword: result.rows.length > 0 ? !!result.rows[0].password : false
    });

    if (result.rows.length === 0) {
      console.log('Usuario no encontrado');
      return res.status(404).json({
        message: 'Usuario no encontrado'
      });
    }

    const user = result.rows[0];

    console.log('Verificando contraseña...');
    // Verificar que la contraseña existe
    if (!user.password) {
      console.error('El usuario no tiene contraseña almacenada');
      return res.status(500).json({
        message: 'Error en la configuración del usuario'
      });
    }

    // Verificar contraseña
    try {
      const validPassword = await bcrypt.compare(password, user.password);
      console.log('Resultado de verificación de contraseña:', validPassword);
      
      if (!validPassword) {
        return res.status(401).json({
          message: 'Credenciales inválidas'
        });
      }
    } catch (bcryptError) {
      console.error('Error al verificar contraseña:', bcryptError);
      return res.status(500).json({
        message: 'Error al verificar credenciales'
      });
    }

    console.log('Generando token JWT...');
    // Generar token incluyendo el rol del usuario
    const token = jwt.sign(
      { 
        id: user.id,
        role: user.role || 'user' // Valor por defecto si role es null
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1d' }
    );

    // Enviar respuesta sin incluir el hash de la contraseña
    const { password: _, ...userWithoutPassword } = user;
    
    console.log('Enviando respuesta exitosa');
    res.json({
      user: {
        ...userWithoutPassword,
        lastName: user.last_name // Mapear last_name a lastName para el frontend
      },
      token
    });
  } catch (error) {
    console.error('=== ERROR EN EL PROCESO DE LOGIN ===');
    console.error('Tipo de error:', error.constructor.name);
    console.error('Mensaje:', error.message);
    console.error('Stack:', error.stack);
    console.error('Código:', error.code);
    console.error('Detalles:', error.detail);
    console.error('Consulta:', error.query);
    console.error('Parámetros:', error.parameters);
    console.error('Restricción:', error.constraint);
    console.error('Tabla:', error.table);
    console.error('Columna:', error.column);
    console.error('Esquema:', error.schema);
    console.error('================================');

    res.status(500).json({
      message: 'Error en el servidor',
      detail: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        code: error.code,
        detail: error.detail
      } : undefined
    });
  }
};

module.exports = {
  register,
  login
}; 