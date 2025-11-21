-- Script de création de la table audit_checklists
-- Exécutez ce script dans votre base de données MySQL (hospital_management)

USE hospital_management;

-- Table des checklists d'audit
CREATE TABLE IF NOT EXISTS audit_checklists (
    id VARCHAR(36) PRIMARY KEY,
    audit_id VARCHAR(36) NOT NULL,
    question TEXT NOT NULL,
    requirement TEXT NULL,
    compliance_status ENUM('conforme', 'non_conforme', 'non_applicable', 'non_évalué') DEFAULT 'non_évalué',
    observation TEXT NULL,
    photo_urls JSON DEFAULT NULL,
    checked_by VARCHAR(36) NULL,
    checked_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE,
    FOREIGN KEY (checked_by) REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_checklists_audit_id ON audit_checklists(audit_id);



