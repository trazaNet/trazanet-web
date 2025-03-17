const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { isAdmin } = require('../middleware/auth');
const { getUsers, deleteUser, updateUserRole } = require('../controllers/admin');

// Todas las rutas requieren autenticación y rol de administrador
router.use(verifyToken, isAdmin);

// Obtener todos los usuarios
router.get('/users', getUsers);

// Eliminar un usuario
router.delete('/users/:id', deleteUser);

// Actualizar el rol de un usuario
router.put('/users/:id/role', updateUserRole);

module.exports = router; 