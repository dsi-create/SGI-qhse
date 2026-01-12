-- Script pour ajouter le champ poste à la table risks
-- Exécutez ce script dans votre base de données MySQL (hospital_management)

USE hospital_management;

-- Ajouter la colonne poste à la table risks
ALTER TABLE risks 
ADD COLUMN poste VARCHAR(255) NULL 
AFTER risk_category;

-- Mettre à jour les risques existants avec un poste par défaut (peut être modifié manuellement)
-- Pour l'instant, on laisse NULL pour que les utilisateurs puissent les assigner
UPDATE risks SET poste = NULL WHERE poste IS NULL;

-- Créer un index pour améliorer les performances de recherche par poste
CREATE INDEX idx_risks_poste ON risks(poste);

-- Vérifier la structure de la table
DESCRIBE risks;



