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

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/animales', animalesRoutes);

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../public')));

// Manejar todas las demás rutas para Angular
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

const PORT = process.env.PORT || 3000;

// Inicializar la base de datos y luego iniciar el servidor
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor iniciado en el puerto ${PORT}`);
      console.log(`Sirviendo archivos estáticos desde: ${path.join(__dirname, '../public')}`);
      console.log(`Ambiente: ${process.env.NODE_ENV}`);
    });
  })
  .catch(error => {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }); 