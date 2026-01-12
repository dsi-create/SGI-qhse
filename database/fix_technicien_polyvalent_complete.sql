-- Script complet pour créer le rôle technicien_polyvalent
-- Exécutez ce script dans votre client MySQL (phpMyAdmin, MySQL Workbench, etc.)

USE hospital_management;

-- Étape 1 : Modifier l'ENUM pour inclure 'technicien_polyvalent'
ALTER TABLE profiles 
MODIFY COLUMN role ENUM(
    'agent_securite', 
    'agent_entretien', 
    'technicien', 
    'superviseur_qhse', 
    'superadmin',
    'secretaire', 
    'superviseur_agent_securite', 
    'superviseur_agent_entretien',
    'superviseur_technicien', 
    'medecin',
    'dop',
    'biomedical',
    'Infirmier',
    'buandiere',
    'employe',
    'technicien_polyvalent'
) NOT NULL;

-- Étape 2 : Vérifier l'utilisateur technicien_polyvalent actuel
SELECT id, username, email, role, service, first_name, last_name
FROM profiles 
WHERE username = 'technicien_polyvalent' OR email = 'technicien.polyvalent@hospital.com';

-- Étape 3 : Mettre à jour le rôle si l'utilisateur existe
UPDATE profiles 
SET role = 'technicien_polyvalent',
    service = COALESCE(service, 'Maintenance Polyvalente'),
    first_name = COALESCE(first_name, 'Technicien'),
    last_name = COALESCE(last_name, 'Polyvalent'),
    civility = COALESCE(civility, 'M.'),
    email = 'technicien.polyvalent@hospital.com'
WHERE (username = 'technicien_polyvalent' OR email = 'technicien.polyvalent@hospital.com')
  AND role != 'technicien_polyvalent';

-- Étape 4 : Créer l'utilisateur s'il n'existe pas
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
) 
SELECT 
    UUID() as id,
    'technicien_polyvalent' as username,
    'technicien.polyvalent@hospital.com' as email,
    '$2a$10$hs8lSfSg4SxcXjjhM1Wq/ebpSXNfVsJ8ay3YSlPCI5IYHVcKmOgoe' as password_hash,
    'Technicien' as first_name,
    'Polyvalent' as last_name,
    'M.' as civility,
    'technicien_polyvalent' as role,
    'Maintenance Polyvalente' as service
WHERE NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE username = 'technicien_polyvalent' OR email = 'technicien.polyvalent@hospital.com'
);

-- Étape 5 : Vérification finale
SELECT 
    username,
    email,
    CONCAT(first_name, ' ', last_name) AS nom_complet,
    role,
    service,
    CASE 
        WHEN role = 'technicien_polyvalent' THEN '✅ Rôle correct'
        WHEN role IS NULL THEN '❌ Rôle NULL'
        WHEN role = '' THEN '❌ Rôle vide'
        ELSE CONCAT('⚠️ Rôle: ', role)
    END AS statut
FROM profiles 
WHERE username = 'technicien_polyvalent' OR email = 'technicien.polyvalent@hospital.com';


