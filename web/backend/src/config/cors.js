const corsOptions = {
  origin: [
    'http://localhost:4200',  // Para desarrollo local
    'https://trazanet.netlify.app',  // Tu dominio de Netlify (ajústalo según tu dominio real)
    /\.netlify\.app$/,  // Permite todos los subdominios de netlify.app
    /localhost:\d+$/    // Permite localhost con cualquier puerto
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

module.exports = corsOptions; 