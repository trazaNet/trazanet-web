-- Crear la tabla de usuarios si no existe
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  dicose VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear la tabla de animales si no existe
CREATE TABLE IF NOT EXISTS animales (
  id SERIAL PRIMARY KEY,
  dispositivo VARCHAR(50),
  raza VARCHAR(100),
  cruza VARCHAR(100),
  sexo VARCHAR(10),
  edad_meses INTEGER,
  edad_dias INTEGER,
  propietario VARCHAR(50),
  nombre_propietario VARCHAR(100),
  ubicacion VARCHAR(200),
  tenedor VARCHAR(100),
  status_vida VARCHAR(50),
  status_trazabilidad VARCHAR(50),
  errores TEXT,
  fecha_identificacion DATE,
  fecha_registro DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar el rendimiento de las búsquedas
CREATE INDEX IF NOT EXISTS idx_animales_dispositivo ON animales(dispositivo);
CREATE INDEX IF NOT EXISTS idx_animales_propietario ON animales(propietario); 