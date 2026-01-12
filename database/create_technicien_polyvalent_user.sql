-- Script pour créer un utilisateur Technicien Polyvalent par défaut
-- Mot de passe par défaut : technicien123
-- Superviseur : Service QHSE
-- NOTE: Le hash du mot de passe doit être généré avec bcrypt. 

USE hospital_management;

-- Créer un utilisateur Technicien Polyvalent par défaut
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
    'technicien_polyvalent',
    'technicien.polyvalent@hospital.com',
    '$2a$10$hs8lSfSg4SxcXjjhM1Wq/ebpSXNfVsJ8ay3YSlPCI5IYHVcKmOgoe', -- bcrypt hash de 'technicien123'
    'Technicien',
    'Polyvalent',
    'M.',
    'technicien_polyvalent',
    'Maintenance Polyvalente'
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
WHERE role = 'technicien_polyvalent';

