-- Script pour créer un utilisateur Secrétaire par défaut
-- Mot de passe par défaut : secretaire123

USE hospital_management;

-- Créer un utilisateur Secrétaire par défaut
INSERT INTO profiles (
    id, 
    username, 
    email, 
    password_hash, 
    first_name, 
    last_name, 
    civility, 
    role,
    service
) VALUES (
    UUID(),
    'secretaire',
    'secretaire@hospital.com',
    '$2a$10$Lk99gn0FmP0MyEoCma3Kz.GpSbEuxwdKsV8JhpGreVC1A19cwfC/O', -- bcrypt hash de 'secretaire123'
    'Secrétaire',
    'Médicale',
    'Mme',
    'secretaire',
    'Secrétariat'
) ON DUPLICATE KEY UPDATE 
    email = VALUES(email),
    password_hash = VALUES(password_hash),
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    civility = VALUES(civility),
    role = VALUES(role),
    service = VALUES(service),
    updated_at = CURRENT_TIMESTAMP;

-- Afficher les informations de connexion
SELECT 
    username,
    email,
    CONCAT(first_name, ' ', last_name) AS nom_complet,
    role,
    service
FROM profiles 
WHERE role = 'secretaire';

