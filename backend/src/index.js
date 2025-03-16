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
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoints - agregamos múltiples rutas para mayor compatibilidad
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/_health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/excel', excelRoutes);
app.use('/api/animales', animalesRoutes);

// Crear directorio public si no existe
const publicPath = path.join(__dirname, '../public');
if (!fs.existsSync(publicPath)) {
  console.log('Creando directorio public...');
  fs.mkdirSync(publicPath, { recursive: true });
}

// Verificar el contenido del directorio public
console.log('Contenido del directorio public:');
fs.readdir(publicPath, (err, files) => {
  if (err) {
    console.error('Error al leer el directorio public:', err);
  } else {
    console.log(files || 'Directorio vacío');
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
    console.log('index.html no encontrado en:', indexPath);
    res.status(404).send('index.html no encontrado');
  }
});

// Inicializar la base de datos y luego iniciar el servidor
console.log('Iniciando inicialización de la base de datos...');
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