-- Script de création de la table risks
-- Exécutez ce script dans votre base de données MySQL (hospital_management)

USE hospital_management;

-- Table des risques
CREATE TABLE IF NOT EXISTS risks (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    risk_category ENUM('biologique', 'chimique', 'physique', 'ergonomique', 'psychosocial', 'sécurité', 'environnemental', 'autre') NOT NULL,
    risk_source VARCHAR(255) NULL,
    probability ENUM('très_faible', 'faible', 'moyenne', 'élevée', 'très_élevée') NOT NULL,
    severity ENUM('négligeable', 'faible', 'modérée', 'importante', 'critique') NOT NULL,
    risk_level ENUM('très_faible', 'faible', 'moyen', 'élevé', 'très_élevé') NOT NULL,
    current_controls TEXT NULL,
    residual_probability ENUM('très_faible', 'faible', 'moyenne', 'élevée', 'très_élevée') NULL,
    residual_severity ENUM('négligeable', 'faible', 'modérée', 'importante', 'critique') NULL,
    residual_risk_level ENUM('très_faible', 'faible', 'moyen', 'élevé', 'très_élevé') NULL,
    treatment_plan TEXT NULL,
    action_plan TEXT NULL,
    responsible_person VARCHAR(255) NULL,
    due_date DATE NULL,
    status ENUM('identifié', 'évalué', 'en_traitement', 'traité', 'surveillé') DEFAULT 'identifié',
    review_date DATE NULL,
    last_review_date DATE NULL,
    reviewed_by VARCHAR(36) NULL,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL,
    FOREIGN KEY (reviewed_by) REFERENCES profiles(id) ON DELETE SET NULL
);




