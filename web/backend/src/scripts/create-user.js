const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

async function createUser() {
  // Configuración del usuario
  const userData = {
    email: 'admin@mail.com',
    password: 'admin123',
    dicose: 'ADMIN001',
    phone: '099123456',
    is_admin: true
  };

  try {
    // Generar hash de la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    
    console.log('Hash generado para la contraseña:', hashedPassword);

    // Conectar a la base de datos
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });

    // Insertar usuario
    const query = `
      INSERT INTO users (dicose, email, phone, password, is_active, is_admin)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO UPDATE 
      SET 
        dicose = EXCLUDED.dicose,
        phone = EXCLUDED.phone,
        password = EXCLUDED.password,
        is_active = EXCLUDED.is_active,
        is_admin = EXCLUDED.is_admin
      RETURNING id, email, dicose, is_admin;
    `;

    const values = [
      userData.dicose,
      userData.email,
      userData.phone,
      hashedPassword,
      true,
      userData.is_admin
    ];

    const result = await pool.query(query, values);
    
    console.log('Usuario creado/actualizado exitosamente:');
    console.log('ID:', result.rows[0].id);
    console.log('Email:', result.rows[0].email);
    console.log('DICOSE:', result.rows[0].dicose);
    console.log('Es Admin:', result.rows[0].is_admin);
    console.log('\nCredenciales de acceso:');
    console.log('Email:', userData.email);
    console.log('Contraseña:', userData.password);

    await pool.end();
  } catch (error) {
    console.error('Error al crear el usuario:', error);
  }
}

createUser(); 