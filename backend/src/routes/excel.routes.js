const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadExcel, getExcelData } = require('../controllers/excel.controller');
const { verifyToken } = require('../middleware/auth');

// Configuración de multer para manejar archivos Excel
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error('Solo se permiten archivos Excel'));
    }
  }
});

// Rutas protegidas que requieren autenticación
router.post('/upload', verifyToken, upload.single('file'), uploadExcel);
router.get('/data', verifyToken, getExcelData);

module.exports = router; 