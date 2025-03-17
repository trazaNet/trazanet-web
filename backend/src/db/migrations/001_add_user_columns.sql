-- Migración: Agregar columnas name, last_name y role a la tabla users
ALTER TABLE users ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

-- Configurar el rol de administrador para el usuario principal
UPDATE users SET role = 'admin' WHERE email = 'juanmchado1@gmail.com'; 