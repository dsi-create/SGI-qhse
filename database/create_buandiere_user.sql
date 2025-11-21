-- Script pour créer un utilisateur Buandière par défaut
-- Mot de passe par défaut : buanderie123
-- Superviseur : Service QHSE
-- NOTE: Le hash du mot de passe doit être généré avec bcrypt. 
-- Utilisez un outil en ligne ou Node.js pour générer le hash correct pour 'buanderie123'

USE hospital_management;

-- Créer un utilisateur Buandière par défaut
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
    'buandiere',
    'buanderie@hospital.com',
    '$2a$10$C8N/4WrlL/A60hgq..bkmegVntlsxbLuxEKaMCim0TGHJ.sbmgsXe', -- bcrypt hash de 'buanderie123'
    'Agent',
    'Buanderie',
    'Mme',
    'buandiere',
    'Buanderie'
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
WHERE role = 'buandiere';

