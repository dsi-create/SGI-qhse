-- Script pour ajouter le rôle 'technicien_polyvalent' à l'ENUM de la table profiles
-- Exécutez ce script pour mettre à jour le schéma de la base de données

USE hospital_management;

-- Modifier l'ENUM pour inclure 'technicien_polyvalent'
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

-- Vérifier que la modification a été appliquée
SHOW COLUMNS FROM profiles WHERE Field = 'role';


