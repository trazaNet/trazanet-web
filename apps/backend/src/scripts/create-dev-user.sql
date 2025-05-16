-- Insertar usuario desarrollador
INSERT INTO users (
  email,
  password, -- La contraseña es 'dev123' hasheada con bcrypt
  name,
  last_name,
  role,
  dicose,
  phone
) VALUES (
  'admin@mail.com',
  '$2b$10$6jM7.1RceSPR8zqfHzGqPOcFqGXwxkQhD7FzTCJcOFJchKqG3Ry/O',
  'Developer',
  'Test',
  'admin',
  '99999',
  '09999999'
) ON CONFLICT (email) DO UPDATE 
SET 
  name = EXCLUDED.name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  dicose = EXCLUDED.dicose,
  phone = EXCLUDED.phone; 