-- Script pour mettre à jour l'utilisateur buandière existant
-- Exécutez ce script après avoir modifié l'ENUM (étape 1)

USE hospital_management;

-- ============================================
-- ÉTAPE 1 : Vérifier l'utilisateur actuel
-- ============================================
SELECT 
    id,
    username,
    
    email,
    role,
    service,
    first_name,
    last_name,
    civility,
    CASE 
        WHEN role = 'buandiere' THEN '✅ Rôle déjà correct'
        WHEN role IS NULL THEN '❌ Rôle NULL - doit être mis à jour'
        WHEN role = '' THEN '❌ Rôle vide - doit être mis à jour'
        ELSE CONCAT('⚠️ Rôle actuel: ', role, ' - doit être changé en buandiere')
    END AS statut
FROM profiles 
WHERE username = 'buandiere' OR email = 'buanderie@hospital.com';

-- ============================================
-- ÉTAPE 2 : Mettre à jour le rôle (exécutez APRÈS avoir modifié l'ENUM)
-- ============================================
-- IMPORTANT : Cette commande ne fonctionnera QUE si l'ENUM a été modifié pour inclure 'buandiere'
-- Si vous obtenez une erreur, exécutez d'abord l'ALTER TABLE de l'étape 1 du script précédent

UPDATE profiles 
SET role = 'buandiere',
    service = 'Buanderie',
    first_name = 'Agent',
    last_name = 'Buanderie',
    civility = 'Mme',
    email = 'buanderie@hospital.com'
WHERE username = 'buandiere';

-- ============================================
-- ÉTAPE 3 : Vérification finale
-- ============================================
SELECT 
    username,
    email,
    CONCAT(first_name, ' ', last_name) AS nom_complet,
    role,
    service,
    CASE 
        WHEN role = 'buandiere' THEN '✅ Rôle correct - Prêt à utiliser !'
        WHEN role IS NULL THEN '❌ Rôle NULL - L''ENUM n''a peut-être pas été modifié'
        WHEN role = '' THEN '❌ Rôle vide - L''ENUM n''a peut-être pas été modifié'
        ELSE CONCAT('⚠️ Rôle: ', role, ' - L''ENUM doit être modifié pour inclure buandiere')
    END AS statut
FROM profiles 
WHERE username = 'buandiere';


