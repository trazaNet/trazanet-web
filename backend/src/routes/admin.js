const express = require('express');
const router = express.Router();
const { getUsers, deleteUser, updateUserRole } = require('../controllers/admin');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.use(verifyToken, isAdmin);

router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/role', updateUserRole);

module.exports = router; 