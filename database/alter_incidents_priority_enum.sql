-- Script pour aligner la colonne "priorite" avec les valeurs attendues
USE hospital_management;

-- Vérifier le type actuel
SHOW COLUMNS FROM incidents LIKE 'priorite';

-- Modifier l'ENUM pour accepter les quatre niveaux
ALTER TABLE incidents
MODIFY priorite ENUM('faible', 'moyenne', 'haute', 'critique') NOT NULL DEFAULT 'moyenne';

-- Nettoyer les valeurs existantes après l'altération
UPDATE incidents
SET priorite = 'moyenne'
WHERE priorite IS NULL OR priorite = '' OR priorite NOT IN ('faible', 'moyenne', 'haute', 'critique');

-- Contrôler le résultat
SELECT priorite, COUNT(*) AS nombre
FROM incidents
GROUP BY priorite;



