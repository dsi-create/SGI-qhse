-- Script de création de la table laundry_tracking
-- Exécutez ce script dans votre base de données MySQL (hospital_management)

USE hospital_management;

-- Table du suivi et traçabilité du linge à la buanderie
CREATE TABLE IF NOT EXISTS laundry_tracking (
    id VARCHAR(36) PRIMARY KEY,
    -- Section Réception
    service_emetteur VARCHAR(255) NOT NULL,
    periode_concernee VARCHAR(255) NULL,
    date_etablissement DATE NOT NULL,
    date_reception DATE NOT NULL,
    service_origine VARCHAR(255) NOT NULL,
    type_linge ENUM('draps', 'coussins', 'blouses', 'gants', 'masques', 'autoclave', 'autre') NOT NULL,
    poids_kg DECIMAL(10, 2) NULL,
    quantite INT NULL,
    etat_linge TEXT NULL,
    -- Section Lavage
    date_lavage DATE NULL,
    machine_utilisee VARCHAR(255) NULL,
    cycle_temperature VARCHAR(255) NULL,
    produit_lessiviel VARCHAR(255) NULL,
    duree_cycle INT NULL,
    agent_lavage VARCHAR(255) NULL,
    controle_visuel BOOLEAN DEFAULT FALSE,
    observations_lavage TEXT NULL,
    -- Section Séchage
    date_sechage DATE NULL,
    type_sechage ENUM('seche_linge', 'naturel', 'autre') NULL,
    temperature_sechage DECIMAL(5, 2) NULL,
    duree_sechage INT NULL,
    repassage_effectue_par VARCHAR(255) NULL,
    controle_qualite_sechage BOOLEAN DEFAULT FALSE,
    -- Section Distribution
    date_livraison DATE NULL,
    service_destinataire VARCHAR(255) NULL,
    type_linge_livre VARCHAR(255) NULL,
    quantite_livree INT NULL,
    etat_linge_livre VARCHAR(255) NULL,
    heure_livraison TIME NULL,
    agent_livreur VARCHAR(255) NULL,
    receptonnaire_nom VARCHAR(255) NULL,
    -- Statut général
    status ENUM('en_reception', 'en_lavage', 'en_sechage', 'en_pliage', 'en_stockage', 'en_distribution', 'termine', 'non_conforme') DEFAULT 'en_reception',
    -- Métadonnées
    created_by VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL
);



