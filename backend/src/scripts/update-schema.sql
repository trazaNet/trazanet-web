ALTER TABLE users 
ADD COLUMN IF NOT EXISTS name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';

UPDATE users SET role = 'admin' WHERE email = 'juanmchado1@gmail.com'; 