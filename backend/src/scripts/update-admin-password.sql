-- Actualizar la contraseña del usuario administrador
-- La contraseña es 'test123' hasheada con bcrypt
UPDATE users 
SET password = '$2b$10$6jM7.1RceSPR8zqfHzGqPOcFqGXwxkQhD7FzTCJcOFJchKqG3Ry/O'
WHERE email = 'juanmchado1@gmail.com'; 