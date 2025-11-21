-- Script pour ajouter le rôle 'buandiere' et 'employe' à l'ENUM de la table profiles
-- Exécutez ce script pour mettre à jour le schéma de la base de données

USE hospital_management;

-- Modifier l'ENUM pour inclure 'buandiere' et 'employe'
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

-- Vérifier que la modification a été appliquée
SHOW COLUMNS FROM profiles WHERE Field = 'role';


