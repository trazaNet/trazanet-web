const db = require('../config/db');

async function checkUser(email) {
  try {
    console.log('Conectando a la base de datos...');
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      console.log('Usuario no encontrado');
      return;
    }

    const user = result.rows[0];
    console.log('Usuario encontrado:', {
      id: user.id,
      email: user.email,
      dicose: user.dicose,
      phone: user.phone,
      name: user.name,
      last_name: user.last_name,
      role: user.role,
      hasPassword: !!user.password
    });
  } catch (error) {
    console.error('Error al verificar usuario:', error);
  } finally {
    process.exit();
  }
}

// Verificar el usuario específico
checkUser('juanmchado1@gmail.com'); 