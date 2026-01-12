-- Script pour ajouter le champ participant_name à la table training_participations
-- Ce champ permet d'enregistrer des participants externes (non dans la base de données)

USE hospital_management;

ALTER TABLE training_participations 
ADD COLUMN participant_name VARCHAR(255) NULL AFTER participant_id;

-- Mettre à jour la contrainte pour rendre participant_id optionnel si participant_name est fourni
-- Note: MySQL ne permet pas de modifier directement une contrainte NOT NULL avec une condition,
-- donc on rend participant_id nullable et on ajoute une contrainte CHECK (mais MySQL < 8.0.16 ne supporte pas CHECK)
-- Pour l'instant, on rend simplement participant_id nullable
ALTER TABLE training_participations 
MODIFY COLUMN participant_id VARCHAR(36) NULL;

-- Ajouter une contrainte pour s'assurer qu'au moins participant_id OU participant_name est fourni
-- Note: Cette contrainte sera gérée au niveau de l'application car MySQL < 8.0.16 ne supporte pas les CHECK constraints



