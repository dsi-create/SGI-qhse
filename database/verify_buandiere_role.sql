-- Script pour vérifier et corriger le rôle de l'utilisateur buandière
-- Exécutez ce script pour vérifier que le rôle est correctement défini

USE hospital_management;

-- Vérifier l'utilisateur buandière
SELECT 
    id,
    username,
    email,
    first_name,
    last_name,
    role,
    service,
    civility
FROM profiles 
WHERE username = 'buandiere' OR email = 'buanderie@hospital.com';

-- Si le rôle n'est pas 'buandiere', le corriger
UPDATE profiles 
SET role = 'buandiere'
WHERE (username = 'buandiere' OR email = 'buanderie@hospital.com')
  AND role != 'buandiere';

-- Vérifier après correction
SELECT 
    username,
    email,
    CONCAT(first_name, ' ', last_name) AS nom_complet,
    role,
    service
FROM profiles 
WHERE role = 'buandiere';


