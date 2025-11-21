-- Script étape par étape pour corriger le rôle buandière
-- Exécutez chaque commande UNE PAR UNE dans votre client MySQL
-- Si une commande échoue, notez l'erreur et passez à la suivante

USE hospital_management;

-- ============================================
-- ÉTAPE 1 : Modifier l'ENUM (exécutez cette commande en premier)
-- ============================================
-- Si cette commande échoue avec une erreur de permissions, 
-- vous devrez peut-être vous connecter avec un utilisateur ayant les droits ALTER
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

-- ============================================
-- ÉTAPE 2 : Vérifier l'utilisateur actuel
-- ============================================
SELECT id, username, email, role, service, first_name, last_name
FROM profiles 
WHERE username = 'buandiere' OR email = 'buanderie@hospital.com';

-- ============================================
-- ÉTAPE 3 : Mettre à jour le rôle si l'utilisateur existe
-- ============================================
UPDATE profiles 
SET role = 'buandiere'
WHERE (username = 'buandiere' OR email = 'buanderie@hospital.com')
  AND role != 'buandiere';

-- Si l'utilisateur existe mais a d'autres champs vides, mettez-les à jour aussi :
UPDATE profiles 
SET service = 'Buanderie',
    first_name = 'Agent',
    last_name = 'Buanderie',
    civility = 'Mme',
    email = 'buanderie@hospital.com'
WHERE (username = 'buandiere' OR email = 'buanderie@hospital.com')
  AND (service IS NULL OR first_name IS NULL OR last_name IS NULL);

-- ============================================
-- ÉTAPE 4 : Créer l'utilisateur s'il n'existe pas
-- ============================================
-- Exécutez cette commande SEULEMENT si l'étape 2 n'a retourné aucun résultat
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
    '$2a$10$C8N/4WrlL/A60hgq..bkmegVntlsxbLuxEKaMCim0TGHJ.sbmgsXe',
    'Agent',
    'Buanderie',
    'Mme',
    'buandiere',
    'Buanderie'
);

-- ============================================
-- ÉTAPE 5 : Vérification finale
-- ============================================
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


