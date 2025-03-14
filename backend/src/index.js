const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
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

// Verificar el contenido del directorio public
const publicPath = path.join(__dirname, '../public');
console.log('Contenido del directorio public:');
fs.readdir(publicPath, (err, files) => {
  if (err) {
    console.error('Error al leer el directorio public:', err);
  } else {
    console.log(files);
  }
});

// Servir archivos estáticos del frontend
app.use(express.static(publicPath, {
  index: false, // Deshabilitar el servido automático de index.html
  maxAge: '1h' // Cache-Control para archivos estáticos
}));

// Manejar todas las demás rutas para Angular
app.get('*', (req, res) => {
  const indexPath = path.join(publicPath, 'index.html');
  console.log('Intentando servir:', indexPath);
  
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error('index.html no encontrado en:', indexPath);
    res.status(404).send('index.html no encontrado');
  }
});

const PORT = process.env.PORT || 3000;

// Inicializar la base de datos y luego iniciar el servidor
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor iniciado en el puerto ${PORT}`);
      console.log(`Sirviendo archivos estáticos desde: ${publicPath}`);
      console.log(`Ambiente: ${process.env.NODE_ENV}`);
    });
  })
  .catch(error => {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }); 