-- Script de création de la table medical_waste
-- Exécutez ce script dans votre base de données MySQL (hospital_management)

USE hospital_management;

-- Table des déchets médicaux
CREATE TABLE IF NOT EXISTS medical_waste (
    id VARCHAR(36) PRIMARY KEY,
    waste_type ENUM('DASRI', 'médicamenteux', 'chimique', 'radioactif', 'autre') NOT NULL,
    category VARCHAR(255) NULL,
    quantity DECIMAL(10, 2) NOT NULL,
    unit ENUM('kg', 'litre', 'unité') NOT NULL,
    collection_date DATE NOT NULL,
    collection_location VARCHAR(255) NOT NULL,
    producer_service VARCHAR(255) NULL,
    waste_code VARCHAR(255) NULL,
    treatment_method VARCHAR(255) NULL,
    treatment_company VARCHAR(255) NULL,
    treatment_date DATE NULL,
    tracking_number VARCHAR(255) NULL,
    certificate_number VARCHAR(255) NULL,
    status ENUM('collecté', 'stocké', 'traité', 'éliminé') DEFAULT 'collecté',
    handled_by VARCHAR(36) NULL,
    registered_by VARCHAR(36) NOT NULL,
    notes TEXT NULL,
    photo_urls JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (registered_by) REFERENCES profiles(id) ON DELETE SET NULL,
    FOREIGN KEY (handled_by) REFERENCES profiles(id) ON DELETE SET NULL
);




