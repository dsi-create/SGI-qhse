-- Script de création de la table audit_action_plans
-- Exécutez ce script dans votre base de données MySQL (hospital_management)

USE hospital_management;

-- Table des plans d'action pour les audits
CREATE TABLE IF NOT EXISTS audit_action_plans (
    id VARCHAR(36) PRIMARY KEY,
    audit_id VARCHAR(36) NOT NULL,
    finding_id VARCHAR(36) NULL, -- Référence à un constat (stored in findings JSON)
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    action_type ENUM('corrective', 'preventive', 'amelioration') NOT NULL,
    priority ENUM('faible', 'moyenne', 'haute', 'critique') DEFAULT 'moyenne',
    assigned_to VARCHAR(36) NULL,
    due_date DATE NULL,
    status ENUM('planifié', 'en_cours', 'terminé', 'verifié', 'annulé') DEFAULT 'planifié',
    completion_date DATE NULL,
    verification_date DATE NULL,
    verified_by VARCHAR(36) NULL,
    notes TEXT NULL,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES profiles(id) ON DELETE SET NULL,
    FOREIGN KEY (verified_by) REFERENCES profiles(id) ON DELETE SET NULL,
    FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_action_plans_audit_id ON audit_action_plans(audit_id);
CREATE INDEX idx_audit_action_plans_assigned_to ON audit_action_plans(assigned_to);
CREATE INDEX idx_audit_action_plans_status ON audit_action_plans(status);



