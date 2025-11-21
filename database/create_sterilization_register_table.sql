-- Script de création de la table sterilization_register
-- Exécutez ce script dans votre base de données MySQL (hospital_management)

USE hospital_management;

-- Table du registre de traçabilité de la stérilisation
CREATE TABLE IF NOT EXISTS sterilization_register (
    id VARCHAR(36) PRIMARY KEY,
    code_document VARCHAR(255) DEFAULT 'EN-STE-001-CDL',
    version VARCHAR(10) DEFAULT 'AA',
    date_cycle DATE NOT NULL,
    service_concerne VARCHAR(255) NOT NULL,
    operateur_nom VARCHAR(255) NOT NULL,
    type_materiel VARCHAR(255) NOT NULL,
    numero_lot VARCHAR(255) NULL,
    methode_sterilisation ENUM('vapeur', 'chaleur_seche', 'ethylene_oxyde', 'plasma_hydrogene', 'autre') NOT NULL,
    numero_cycle VARCHAR(255) NULL,
    programme VARCHAR(255) NULL,
    temperature DECIMAL(5, 2) NULL,
    duree_cycle INT NULL,
    resultat_test_controle ENUM('conforme', 'non_conforme', 'en_attente') DEFAULT 'en_attente',
    status_cycle ENUM('en_cours', 'terminé', 'échoué', 'interrompu') DEFAULT 'en_cours',
    observation_action_corrective TEXT NULL,
    -- Contrôle des charges
    date_controle DATE NULL,
    type_charge VARCHAR(255) NULL,
    nombre_unites INT NULL,
    numero_cycle_controle VARCHAR(255) NULL,
    resultat_controle ENUM('acceptee', 'rejetee', 'en_attente') NULL,
    statut_charge ENUM('acceptee', 'rejetee', 'en_attente') NULL,
    -- Libération
    date_liberation DATE NULL,
    numero_lot_charge VARCHAR(255) NULL,
    service_destinataire VARCHAR(255) NULL,
    delai_validite DATE NULL,
    observations_liberation TEXT NULL,
    -- Maintenance
    date_maintenance DATE NULL,
    type_operation_maintenance VARCHAR(255) NULL,
    nom_technicien VARCHAR(255) NULL,
    resultat_controle_maintenance ENUM('conforme', 'non_conforme', 'en_attente') NULL,
    observations_maintenance TEXT NULL,
    -- Non-conformités
    observations_generales TEXT NULL,
    non_conformites TEXT NULL,
    -- Validation
    responsable_sterilisation VARCHAR(255) NULL,
    date_validation DATE NULL,
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL
);




