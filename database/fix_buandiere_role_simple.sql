-- Script simplifié pour corriger le rôle buandière
-- Exécutez ce script dans votre client MySQL (phpMyAdmin, MySQL Workbench, etc.)
-- Ce script évite l'utilisation d'INFORMATION_SCHEMA qui nécessite des permissions spéciales

USE hospital_management;

-- Étape 1 : Modifier l'ENUM pour inclure 'buandiere' et 'employe'
-- Si cette commande échoue, vous devrez peut-être exécuter les commandes une par une
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

-- Étape 2 : Vérifier l'utilisateur buandière actuel
SELECT id, username, email, role, service, first_name, last_name
FROM profiles 
WHERE username = 'buandiere' OR email = 'buanderie@hospital.com';

-- Étape 3 : Mettre à jour le rôle de l'utilisateur existant
-- Cette commande met à jour l'utilisateur s'il existe déjà
UPDATE profiles 
SET role = 'buandiere',
    service = COALESCE(service, 'Buanderie'),
    first_name = COALESCE(first_name, 'Agent'),
    last_name = COALESCE(last_name, 'Buanderie'),
    civility = COALESCE(civility, 'Mme'),
    email = 'buanderie@hospital.com'
WHERE (username = 'buandiere' OR email = 'buanderie@hospital.com')
  AND role != 'buandiere';

-- Étape 4 : Créer l'utilisateur s'il n'existe pas
-- Utilisez cette commande seulement si l'utilisateur n'existe pas (vérifiez avec l'étape 2)
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
    'buandiere' as username,
    'buanderie@hospital.com' as email,
    '$2a$10$C8N/4WrlL/A60hgq..bkmegVntlsxbLuxEKaMCim0TGHJ.sbmgsXe' as password_hash,
    'Agent' as first_name,
    'Buanderie' as last_name,
    'Mme' as civility,
    'buandiere' as role,
    'Buanderie' as service
WHERE NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE username = 'buandiere' OR email = 'buanderie@hospital.com'
);

-- Étape 5 : Vérification finale
SELECT 
    username,
    email,
    CONCAT(first_name, ' ', last_name) AS nom_complet,
    role,
    service,
    CASE 
        WHEN role = 'buandiere' THEN '✅ Rôle correct'
        WHEN role IS NULL THEN '❌ Rôle NULL'
        WHEN role = '' THEN '❌ Rôle vide'
        ELSE CONCAT('⚠️ Rôle: ', role)
    END AS statut
FROM profiles 
WHERE username = 'buandiere' OR email = 'buanderie@hospital.com';


