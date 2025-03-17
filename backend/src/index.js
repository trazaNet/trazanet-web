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
  console.log('Health check request received at /health');
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/healthz', (req, res) => {
  console.log('Health check request received at /healthz');
  res.status(200).json({ status: 'ok' });
});

app.get('/_health', (req, res) => {
  console.log('Health check request received at /_health');
  res.status(200).json({ status: 'ok' });
});

// Routes API - Manejar todas las rutas de la API primero
app.use('/api', (req, res, next) => {
  console.log('API request received:', req.method, req.url);
  next();
});

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

// Manejar rutas de la API no encontradas
app.all('/api/*', (req, res) => {
  console.log('API route not found:', req.method, req.url);
  res.status(404).json({ message: 'API endpoint not found' });
});

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

// Primero iniciamos el servidor
console.log('Iniciando el servidor...');
const server = app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
  console.log(`Sirviendo archivos estáticos desde: ${publicPath}`);
  console.log(`Ambiente: ${process.env.NODE_ENV}`);
});

// Luego inicializamos la base de datos
console.log('Iniciando inicialización de la base de datos...');
initializeDatabase()
  .then(() => {
    console.log('Base de datos inicializada correctamente');
  })
  .catch(error => {
    console.error('Error al inicializar la base de datos:', error);
    // No cerramos el servidor, solo logueamos el error
    console.log('El servidor continuará funcionando sin la base de datos');
  }); 