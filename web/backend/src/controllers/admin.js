const db = require('../config/db');

const getUsers = async (req, res) => {
  let client;
  try {
    client = await db.getClient();
    const result = await client.query(
      'SELECT id, email, name, last_name, role, dicose, phone FROM users ORDER BY id'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  } finally {
    if (client) {
      client.release();
    }
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  let client;

  try {
    client = await db.getClient();
    
    // Verificar que el usuario existe y no es admin
    const userCheck = await client.query(
      'SELECT role FROM users WHERE id = $1',
      [id]
    );

    if (userCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (userCheck.rows[0].role === 'admin') {
      return res.status(403).json({ message: 'No se puede eliminar un usuario administrador' });
    }

    await client.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error al eliminar usuario' });
  } finally {
    if (client) {
      client.release();
    }
  }
};

const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  let client;

  if (!['admin', 'user'].includes(role)) {
    return res.status(400).json({ message: 'Rol inválido' });
  }

  try {
    client = await db.getClient();
    const result = await client.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, name, last_name, role, dicose, phone',
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    res.status(500).json({ message: 'Error al actualizar rol' });
  } finally {
    if (client) {
      client.release();
    }
  }
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  let client;
  try {
    client = await db.getClient();
    const result = await client.query(
      'SELECT id, email, name, last_name, role, dicose, phone FROM users WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ message: 'Error al obtener usuario' });
  } finally {
    if (client) {
      client.release();
    }
  }
};

module.exports = {
  getUsers,
  deleteUser,
  updateUserRole,
  getUserById
}; 