const express = require('express');
const router = express.Router();
const inversionesController = require('../controllers/inversiones.controller');
const { verifyToken } = require('../middleware/auth');

// Rutas para inversiones
router.get('/', verifyToken, inversionesController.getAllInversiones);
router.post('/', verifyToken, inversionesController.createInversion);
router.put('/:id', verifyToken, inversionesController.updateInversion);
router.delete('/:id', verifyToken, inversionesController.deleteInversion);

module.exports = router; 