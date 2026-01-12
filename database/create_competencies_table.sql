-- Script de création de la table competencies
-- Exécutez ce script dans votre base de données MySQL (hospital_management)

USE hospital_management;

CREATE TABLE IF NOT EXISTS competencies (
    id VARCHAR(36) PRIMARY KEY,
    employee_id VARCHAR(36) NOT NULL,
    skill_name VARCHAR(255) NOT NULL,
    skill_category VARCHAR(255) NULL,
    level ENUM('débutant', 'intermédiaire', 'avancé', 'expert') DEFAULT 'débutant',
    certification_number VARCHAR(255) NULL,
    issued_date DATE NULL,
    expiry_date DATE NULL,
    issuing_authority VARCHAR(255) NULL,
    verified BOOLEAN DEFAULT FALSE,
    verified_by VARCHAR(36) NULL,
    verification_date DATE NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (verified_by) REFERENCES profiles(id) ON DELETE SET NULL,
    INDEX idx_employee_id (employee_id),
    INDEX idx_expiry_date (expiry_date)
);




