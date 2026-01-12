-- Script de création de la table risk_actions pour structurer les plans d'action
-- Exécutez ce script dans votre base de données MySQL (hospital_management)

USE hospital_management;

-- Table des actions de risque
CREATE TABLE IF NOT EXISTS risk_actions (
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



