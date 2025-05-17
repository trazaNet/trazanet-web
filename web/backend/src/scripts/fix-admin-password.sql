-- Corregir la contraseña del usuario administrador
-- La contraseña es 'test123' hasheada con bcrypt
UPDATE users 
SET password = '$2b$10$pjfb4bigy88.g2lLW9MrOuRZT3bxy1mocEVDEIUrbDXa28pqhQodK'
WHERE email = 'juanmchado1@gmail.com'; 