const db = require('../config/db');

async function makeAdmin(email) {
  try {
    const result = await db.query(
      'UPDATE users SET role = $1 WHERE email = $2 RETURNING *',
      ['admin', email]
    );

    if (result.rows.length === 0) {
      console.log('Usuario no encontrado');
      process.exit(1);
    }

    console.log('Usuario actualizado a administrador:', result.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

makeAdmin('juanmchado1@gmail.com'); 