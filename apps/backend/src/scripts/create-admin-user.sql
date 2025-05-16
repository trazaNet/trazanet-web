-- Insertar usuario administrador
INSERT INTO users (
  email,
  password, -- La contraseña es 'test123' hasheada con bcrypt
  name,
  last_name,
  role,
  dicose,
  phone
) VALUES (
  'juanmchado1@gmail.com',
  '$2b$10$6jM7.1RceSPR8zqfHzGqPOcFqGXwxkQhD7FzTCJcOFJchKqG3Ry/O',
  'Juan',
  'Machado',
  'admin',
  '12345',
  '12345678'
) ON CONFLICT (email) DO UPDATE 
SET 
  name = EXCLUDED.name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  dicose = EXCLUDED.dicose,
  phone = EXCLUDED.phone; 