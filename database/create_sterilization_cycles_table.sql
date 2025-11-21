-- Script de création de la table sterilization_cycles
-- Exécutez ce script dans votre base de données MySQL (hospital_management)

USE hospital_management;

-- Table des cycles de stérilisation
CREATE TABLE IF NOT EXISTS sterilization_cycles (
    id VARCHAR(36) PRIMARY KEY,
    cycle_number VARCHAR(255) NOT NULL,
    sterilizer_id VARCHAR(255) NOT NULL,
    sterilizer_type ENUM('autoclave', 'ETO', 'plasma', 'peroxyde') NOT NULL,
    cycle_type ENUM('stérilisation', 'désinfection', 'préventif') NOT NULL,
    program_name VARCHAR(255) NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NULL,
    duration_minutes INT NULL,
    temperature DECIMAL(5, 2) NULL,
    pressure DECIMAL(5, 2) NULL,
    operator_id VARCHAR(36) NOT NULL,
    status ENUM('en_cours', 'terminé', 'échoué', 'annulé') DEFAULT 'en_cours',
    result ENUM('conforme', 'non_conforme', 'en_attente') DEFAULT 'en_attente',
    biological_indicator_result ENUM('conforme', 'non_conforme', 'non_testé') DEFAULT 'non_testé',
    chemical_indicator_result ENUM('conforme', 'non_conforme', 'non_testé') DEFAULT 'non_testé',
    non_conformity_reason TEXT NULL,
    batch_number VARCHAR(255) NULL,
    items_count INT DEFAULT 0,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (operator_id) REFERENCES profiles(id) ON DELETE SET NULL
);




