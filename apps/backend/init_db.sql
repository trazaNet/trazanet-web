-- Crear la base de datos si no existe
CREATE DATABASE trazanet;

-- Conectar a la base de datos
\c trazanet;

-- Eliminar las tablas si existen
DROP TABLE IF EXISTS animales;
DROP TABLE IF EXISTS users;

-- Crear la tabla de usuarios
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    dicose VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear la tabla de animales
CREATE TABLE animales (
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
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices
CREATE INDEX idx_animales_user_id ON animales(user_id);
CREATE INDEX idx_animales_dispositivo ON animales(dispositivo);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_dicose ON users(dicose); 