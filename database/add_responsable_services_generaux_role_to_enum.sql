-- Ajoute les rôles responsable_services_generaux et cuisine à l'ENUM profiles.role
-- À exécuter sur hospital_management (MySQL)

USE hospital_management;

ALTER TABLE profiles
MODIFY COLUMN role ENUM(
    'agent_securite',
    'agent_entretien',
    'technicien',
    'superviseur_qhse',
    'assistante_qhse',
    'superadmin',
    'secretaire',
    'superviseur_agent_securite',
    'superviseur_agent_entretien',
    'superviseur_technicien',
    'medecin',
    'biomedical',
    'dop',
    'Infirmier',
    'buandiere',
    'employe',
    'technicien_polyvalent',
    'administrateur_reseau',
    'responsable_services_generaux',
    'cuisine'
) NOT NULL;

DESCRIBE profiles;
