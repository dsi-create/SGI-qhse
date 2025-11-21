-- Script de création de la table trainings
-- Exécutez ce script dans votre base de données MySQL (hospital_management)

USE hospital_management;

-- Table des formations
CREATE TABLE IF NOT EXISTS trainings (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    description TEXT NULL,
    trainer VARCHAR(255) NULL,
    training_type ENUM('interne', 'externe', 'en_ligne', 'présentiel') NOT NULL,
    duration_hours DECIMAL(5, 2) NULL,
    location VARCHAR(255) NULL,
    planned_date DATE NULL,
    actual_date DATE NULL,
    status ENUM('planifiée', 'en_cours', 'terminée', 'annulée') DEFAULT 'planifiée',
    max_participants INT NULL,
    certificate_required BOOLEAN DEFAULT FALSE,
    validity_months INT NULL,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL
);




