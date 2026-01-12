-- Script de création de la table training_participations
-- Exécutez ce script dans votre base de données MySQL (hospital_management)

USE hospital_management;

CREATE TABLE IF NOT EXISTS training_participations (
    id VARCHAR(36) PRIMARY KEY,
    training_id VARCHAR(36) NOT NULL,
    participant_id VARCHAR(36) NOT NULL,
    registration_status ENUM('inscrit', 'présent', 'absent', 'excused') DEFAULT 'inscrit',
    attendance_date DATE NULL,
    score DECIMAL(5,2) NULL,
    passed BOOLEAN DEFAULT FALSE,
    certificate_number VARCHAR(255) NULL,
    certificate_issued_date DATE NULL,
    certificate_expiry_date DATE NULL,
    comments TEXT NULL,
    registered_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (training_id) REFERENCES trainings(id) ON DELETE CASCADE,
    FOREIGN KEY (participant_id) REFERENCES profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (registered_by) REFERENCES profiles(id) ON DELETE RESTRICT,
    UNIQUE KEY unique_training_participant (training_id, participant_id),
    INDEX idx_participant_id (participant_id),
    INDEX idx_certificate_expiry (certificate_expiry_date)
);




