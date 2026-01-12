-- Script de création de la table audits
-- Exécutez ce script dans votre base de données MySQL (hospital_management)

USE hospital_management;

-- Table des audits
CREATE TABLE IF NOT EXISTS audits (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    audit_type ENUM('interne', 'externe', 'certification', 'inspection') NOT NULL,
    scope TEXT NOT NULL,
    planned_date DATE NOT NULL,
    actual_date DATE NULL,
    auditor_id VARCHAR(36) NULL,
    audited_department VARCHAR(255) NULL,
    status ENUM('planifié', 'en_cours', 'terminé', 'annulé') DEFAULT 'planifié',
    findings JSON NULL,
    non_conformities_count INT DEFAULT 0,
    conformities_count INT DEFAULT 0,
    opportunities_count INT DEFAULT 0,
    report_path VARCHAR(255) NULL,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL,
    FOREIGN KEY (auditor_id) REFERENCES profiles(id) ON DELETE SET NULL
);




