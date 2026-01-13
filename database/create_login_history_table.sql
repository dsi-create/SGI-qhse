-- Script de création de la table login_history
-- Exécutez ce script dans votre base de données MySQL (hospital_management)

USE hospital_management;

-- Table des historiques de connexion
CREATE TABLE IF NOT EXISTS login_history (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP NULL,
    session_duration INT NULL, -- Durée en secondes
    status ENUM('success', 'failed', 'expired') DEFAULT 'success',
    failure_reason VARCHAR(255) NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_email (email),
    INDEX idx_login_time (login_time),
    INDEX idx_role (role),
    FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

