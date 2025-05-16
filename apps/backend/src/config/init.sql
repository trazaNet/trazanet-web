CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  dicose VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(20) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS excel_data (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  filename VARCHAR(255) NOT NULL,
  fecha_ingreso DATE,
  nro_dicose VARCHAR(50),
  nro_lote VARCHAR(50),
  cantidad INTEGER,
  peso_total DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS animales (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  dispositivo VARCHAR(50) NOT NULL,
  raza VARCHAR(100),
  cruza VARCHAR(100),
  sexo VARCHAR(1),
  edad_meses INTEGER,
  edad_dias INTEGER,
  propietario VARCHAR(50) NOT NULL,
  nombre_propietario VARCHAR(100),
  ubicacion VARCHAR(100),
  tenedor VARCHAR(100),
  status_vida VARCHAR(50),
  status_trazabilidad VARCHAR(50),
  errores TEXT,
  fecha_identificacion DATE,
  fecha_registro DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 