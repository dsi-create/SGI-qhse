-- Script de correction simple pour la table risk_actions
-- Exécutez ce script dans votre base de données MySQL (hospital_management)
-- ATTENTION: Ce script supprime la table existante et la recrée
-- Si vous avez des données importantes, sauvegardez-les d'abord

USE hospital_management;

-- Supprimer la table si elle existe (ATTENTION: cela supprime toutes les données)
DROP TABLE IF EXISTS risk_actions;

-- Recréer la table avec le bon schéma
CREATE TABLE risk_actions (
    id VARCHAR(36) PRIMARY KEY,
    risk_id VARCHAR(36) NOT NULL,
    action_title VARCHAR(255) NOT NULL,
    action_description TEXT NULL,
    action_type ENUM('prévention', 'mitigation', 'transfert', 'acceptation') DEFAULT 'mitigation',
    action_status ENUM('planifiée', 'en_cours', 'terminée', 'annulée') DEFAULT 'planifiée',
    responsible_person VARCHAR(255) NULL,
    assigned_to VARCHAR(36) NULL,
    due_date DATE NULL,
    completion_date DATE NULL,
    effectiveness_level ENUM('très_élevée', 'élevée', 'moyenne', 'faible') NULL,
    notes TEXT NULL,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (risk_id) REFERENCES risks(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES profiles(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL,
    INDEX idx_risk_id (risk_id),
    INDEX idx_due_date (due_date),
    INDEX idx_action_status (action_status)
);



