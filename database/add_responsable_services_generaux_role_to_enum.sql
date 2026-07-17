-- =============================================================================
-- MySQL uniquement (WAMP / hospital_management)
-- =============================================================================
-- Ne pas exécuter ce fichier dans Supabase (PostgreSQL).
-- Pour Supabase, utiliser :
--   supabase/migrations/0034_add_responsable_services_generaux_and_cuisine_roles.sql
-- =============================================================================

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
