-- Script UNIQUEMENT pour modifier l'ENUM
-- Exécutez cette commande en premier, puis exécutez update_existing_buandiere.sql

USE hospital_management;

-- Modifier l'ENUM pour inclure 'buandiere' et 'employe'
-- Si cette commande échoue avec une erreur de permissions, 
-- vous devrez vous connecter avec un utilisateur ayant les droits ALTER
-- ou utiliser la ligne de commande MySQL

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

-- Vérification que la modification a réussi
-- Si cette requête retourne une erreur, ignorez-la et passez à l'étape suivante
SHOW COLUMNS FROM profiles WHERE Field = 'role';


