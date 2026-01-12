-- Script pour mettre à jour les incidents qui n'ont pas de priorité définie
-- Exécutez ce script dans votre base de données si vous avez des incidents sans priorité

USE hospital_management;

-- Mettre à jour les incidents sans priorité ou avec priorité NULL à 'moyenne'
UPDATE incidents 
SET priorite = 'moyenne' 
WHERE priorite IS NULL OR priorite = '' OR priorite NOT IN ('faible', 'moyenne', 'haute', 'critique');

-- Normaliser les priorités existantes (enlever espaces, mettre en minuscules)
UPDATE incidents 
SET priorite = LOWER(TRIM(priorite))
WHERE priorite IS NOT NULL AND priorite != '';

-- Vérifier les résultats
SELECT id, type, priorite, date_creation, service
FROM incidents 
ORDER BY date_creation DESC 
LIMIT 20;

-- Compter les incidents par priorité
SELECT priorite, COUNT(*) as nombre
FROM incidents
GROUP BY priorite;

