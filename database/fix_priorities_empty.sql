-- Script pour corriger les incidents avec priorité vide ou invalide
USE hospital_management;

-- Vérifier les incidents avec priorité vide ou invalide
SELECT id, type, priorite, service, date_creation
FROM incidents 
WHERE priorite IS NULL 
   OR priorite = '' 
   OR priorite NOT IN ('faible', 'moyenne', 'haute', 'critique')
ORDER BY date_creation DESC;

-- Corriger les incidents avec priorité vide ou invalide
UPDATE incidents 
SET priorite = 'moyenne' 
WHERE priorite IS NULL 
   OR priorite = '' 
   OR priorite NOT IN ('faible', 'moyenne', 'haute', 'critique');

-- Vérifier la structure de la colonne priorite
SHOW COLUMNS FROM incidents LIKE 'priorite';

-- Tester l'insertion d'un incident avec différentes priorités
-- (Ces INSERT seront rollbackés, c'est juste pour tester)
START TRANSACTION;

-- Test 1: Priorité 'haute'
INSERT INTO incidents (id, type, description, reported_by, statut, priorite, service, lieu)
VALUES (UUID(), 'test', 'Test haute priorité', (SELECT id FROM profiles LIMIT 1), 'nouveau', 'haute', 'test', 'test');

-- Test 2: Priorité 'critique'
INSERT INTO incidents (id, type, description, reported_by, statut, priorite, service, lieu)
VALUES (UUID(), 'test', 'Test critique priorité', (SELECT id FROM profiles LIMIT 1), 'nouveau', 'critique', 'test', 'test');

-- Vérifier les valeurs insérées
SELECT id, priorite, CAST(priorite AS CHAR) as priorite_str
FROM incidents 
WHERE type = 'test'
ORDER BY date_creation DESC;

-- Rollback pour ne pas garder les tests
ROLLBACK;

-- Vérifier tous les incidents et leurs priorités
SELECT 
    id,
    type,
    priorite,
    CAST(priorite AS CHAR) as priorite_str,
    LENGTH(priorite) as priorite_length,
    service,
    date_creation
FROM incidents 
ORDER BY date_creation DESC 
LIMIT 10;



