-- Script pour ajouter les champs de programmation aux audits
-- Exécutez ce script dans votre base de données MySQL (hospital_management)

USE hospital_management;

-- Ajouter les champs de programmation et rappels
-- Note: MySQL ne supporte pas "IF NOT EXISTS" dans ALTER TABLE, 
-- exécutez chaque ligne séparément si certaines colonnes existent déjà

ALTER TABLE audits 
ADD COLUMN recurrence_type ENUM('aucune', 'quotidienne', 'hebdomadaire', 'mensuelle', 'trimestrielle', 'semestrielle', 'annuelle') DEFAULT 'aucune',
ADD COLUMN recurrence_interval INT DEFAULT NULL,
ADD COLUMN next_audit_date DATE NULL,
ADD COLUMN reminder_days_before INT DEFAULT 7,
ADD COLUMN auto_generate_report BOOLEAN DEFAULT FALSE,
ADD COLUMN report_generation_date DATE NULL;

