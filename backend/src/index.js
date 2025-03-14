const express = require('express');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');
const excelRoutes = require('./routes/excel.routes');
const animalesRoutes = require('./routes/animales.routes');
const initializeDatabase = require('./db/init');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../public')));

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/animales', animalesRoutes);

// Manejar todas las demás rutas para Angular
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;

// Inicializar la base de datos y luego iniciar el servidor
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }); 