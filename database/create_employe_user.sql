-- Script pour créer un utilisateur avec le rôle "employe" (Portail Employé)
-- Mot de passe par défaut : employe123
-- NOTE: Si ce script ne fonctionne pas, créez l'utilisateur via l'interface Super Admin

USE hospital_management;

-- Créer un utilisateur Employé par défaut dans la table profiles
-- Le hash bcrypt doit être généré avec bcryptjs (10 rounds)
-- Pour générer un nouveau hash, utilisez : bcryptjs.hashSync('employe123', 10)
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
    'employe',
    'employe@hospital.com',
    '$2a$10$RZoXTRu73i37NJ9lvFtDxO6PdDgrjtSeOj56/ZqNJFR11A/H580/C', -- bcrypt hash de 'employe123'
    'Employé',
    '',
    'M.',
    'employe',
    'Général'
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
WHERE role = 'employe';
