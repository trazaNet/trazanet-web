const corsOptions = {
  origin: 'http://localhost:4200',  // Para desarrollo local
  credentials: false,  // Cambiado a false ya que estamos usando token en el header
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 600 // 10 minutos
};

module.exports = corsOptions; 