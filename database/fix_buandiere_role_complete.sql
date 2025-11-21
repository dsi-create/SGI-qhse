-- Script complet pour corriger le rôle buandière
-- Exécutez ce script dans votre client MySQL (phpMyAdmin, MySQL Workbench, etc.)

USE hospital_management;

-- Étape 1 : Vérifier l'état actuel de l'ENUM
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'hospital_management' 
  AND TABLE_NAME = 'profiles' 
  AND COLUMN_NAME = 'role';

-- Étape 2 : Modifier l'ENUM pour inclure 'buandiere' et 'employe'
-- Note: Si vous avez des données existantes avec des valeurs NULL, elles seront perdues
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
    'employe'
) NOT NULL;

-- Étape 3 : Vérifier et corriger l'utilisateur buandière
-- D'abord, vérifier s'il existe
SELECT id, username, email, role, service 
FROM profiles 
WHERE username = 'buandiere' OR email = 'buanderie@hospital.com';

-- Mettre à jour le rôle si l'utilisateur existe mais n'a pas le bon rôle
UPDATE profiles 
SET role = 'buandiere',
    service = 'Buanderie',
    first_name = 'Agent',
    last_name = 'Buanderie',
    civility = 'Mme',
    email = 'buanderie@hospital.com'
WHERE (username = 'buandiere' OR email = 'buanderie@hospital.com')
  AND (role IS NULL OR role = '' OR role NOT IN (
    'agent_securite', 'agent_entretien', 'technicien', 'superviseur_qhse', 
    'superadmin', 'secretaire', 'superviseur_agent_securite', 
    'superviseur_agent_entretien', 'superviseur_technicien', 'medecin',
    'dop', 'biomedical', 'Infirmier', 'buandiere', 'employe'
  ));

-- Étape 4 : Si l'utilisateur n'existe pas, le créer
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
    UUID(),
    'buandiere',
    'buanderie@hospital.com',
    '$2a$10$C8N/4WrlL/A60hgq..bkmegVntlsxbLuxEKaMCim0TGHJ.sbmgsXe', -- bcrypt hash de 'buanderie123'
    'Agent',
    'Buanderie',
    'Mme',
    'buandiere',
    'Buanderie'
WHERE NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE username = 'buandiere' OR email = 'buanderie@hospital.com'
);

-- Étape 5 : Vérification finale
SELECT 
    id,
    username,
    email,
    CONCAT(first_name, ' ', last_name) AS nom_complet,
    role,
    service,
    civility,
    CASE 
        WHEN role = 'buandiere' THEN '✅ Rôle correct'
        WHEN role IS NULL THEN '❌ Rôle NULL'
        WHEN role = '' THEN '❌ Rôle vide'
        ELSE CONCAT('⚠️ Rôle incorrect: ', role)
    END AS statut_role
FROM profiles 
WHERE username = 'buandiere' OR email = 'buanderie@hospital.com';

-- Étape 6 : Vérifier que l'ENUM a été mis à jour
SELECT COLUMN_TYPE 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'hospital_management' 
  AND TABLE_NAME = 'profiles' 
  AND COLUMN_NAME = 'role';


