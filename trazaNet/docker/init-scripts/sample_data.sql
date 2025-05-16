-- Script para insertar datos de ejemplo en las tablas

-- Datos de ejemplo para la tabla users
INSERT INTO public.users(dicose, email, phone, password, is_active, is_admin)
VALUES 
('12345', 'juan.perez@ejemplo.com', '099123456', 'pass123', true, true),
('23456', 'maria.rodriguez@ejemplo.com', '098234567', 'pass456', true, false),
('34567', 'carlos.gomez@ejemplo.com', '095345678', 'pass789', true, false),
('45678', 'lucia.martinez@ejemplo.com', '094456789', 'pass012', true, false),
('56789', 'alejandro.lopez@ejemplo.com', '093567890', 'pass345', true, false),
('67890', 'ana.fernandez@ejemplo.com', '092678901', 'pass678', true, false),
('78901', 'pedro.diaz@ejemplo.com', '091789012', 'pass901', true, false),
('89012', 'sofia.torres@ejemplo.com', '099890123', 'pass234', true, false),
('90123', 'gabriel.sanchez@ejemplo.com', '098901234', 'pass567', true, false),
('01234', 'valentina.ruiz@ejemplo.com', '097012345', 'pass890', true, false);

-- Datos de ejemplo para la tabla animales
INSERT INTO public.animales(dispositivo, nombre_propietario, edad_meses, peso_kg, raza, sexo)
VALUES 
('DISP001', 'Juan Pérez', 24, 450.5, 'Hereford', 'Macho'),
('DISP002', 'María Rodríguez', 36, 520.3, 'Aberdeen Angus', 'Hembra'),
('DISP003', 'Carlos Gómez', 18, 380.7, 'Braford', 'Macho'),
('DISP004', 'Lucía Martínez', 48, 610.2, 'Holstein', 'Hembra'),
('DISP005', 'Alejandro López', 30, 490.5, 'Brangus', 'Macho'),
('DISP006', 'Ana Fernández', 42, 580.8, 'Hereford', 'Hembra'),
('DISP007', 'Pedro Díaz', 12, 320.1, 'Aberdeen Angus', 'Macho'),
('DISP008', 'Sofía Torres', 54, 650.4, 'Braford', 'Hembra'),
('DISP009', 'Gabriel Sánchez', 27, 470.9, 'Holstein', 'Macho'),
('DISP010', 'Valentina Ruiz', 39, 540.6, 'Brangus', 'Hembra'),
('DISP011', 'Fernando Acosta', 15, 350.2, 'Hereford', 'Macho'),
('DISP012', 'Carolina Pérez', 33, 510.7, 'Aberdeen Angus', 'Hembra'),
('DISP013', 'Roberto González', 21, 430.4, 'Braford', 'Macho'),
('DISP014', 'Isabel Torres', 45, 600.3, 'Holstein', 'Hembra'),
('DISP015', 'Miguel Rodríguez', 9, 280.8, 'Brangus', 'Macho'),
('DISP016', 'Laura Gómez', 51, 630.1, 'Hereford', 'Hembra'),
('DISP017', 'Diego Martínez', 24, 460.5, 'Aberdeen Angus', 'Macho'),
('DISP018', 'Paula Sánchez', 36, 530.9, 'Braford', 'Hembra'),
('DISP019', 'Andrés Fernández', 18, 390.2, 'Holstein', 'Macho'),
('DISP020', 'Camila López', 48, 620.7, 'Brangus', 'Hembra'); 