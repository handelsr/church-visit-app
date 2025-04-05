-- Migración para añadir el campo name a la tabla users
USE campaign_attendance;

-- Verificar si la columna ya existe
SET @columnExists = 0;
SELECT COUNT(*) INTO @columnExists 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'campaign_attendance' 
AND TABLE_NAME = 'users' 
AND COLUMN_NAME = 'name';

-- Añadir la columna solo si no existe
SET @query = IF(@columnExists = 0, 
                'ALTER TABLE users ADD COLUMN name VARCHAR(100) AFTER password', 
                'SELECT "La columna name ya existe en la tabla users"');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Actualizar los registros existentes con nombres predeterminados
UPDATE users SET name = 'Administrador' WHERE username = 'admin' AND name IS NULL;
UPDATE users SET name = CONCAT('Secretaria ', SUBSTRING(username, 11)) WHERE username LIKE 'secretaria%' AND name IS NULL;
UPDATE users SET name = 'Usuario de Consulta' WHERE username = 'consulta' AND name IS NULL;

-- Actualizar la tabla secretaries para usar los nombres de la tabla users
UPDATE secretaries s
JOIN users u ON s.user_id = u.id
SET s.name = u.name
WHERE u.name IS NOT NULL; 