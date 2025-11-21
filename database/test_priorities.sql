-- Script de test pour vérifier les priorités dans la base de données
-- Exécutez ce script pour diagnostiquer le problème des priorités

USE hospital_management;

-- Afficher toutes les priorités avec leur format exact
SELECT 
    id,
    type,
    priorite,
    CHAR_LENGTH(priorite) as longueur,
    ASCII(priorite) as premier_caractere,
    HEX(priorite) as hexa,
    date_creation
FROM incidents
ORDER BY date_creation DESC
LIMIT 10;

-- Compter les incidents par priorité (exactement comme stocké)
SELECT 
    priorite,
    COUNT(*) as nombre,
    GROUP_CONCAT(id) as ids
FROM incidents
GROUP BY priorite;

-- Tester l'insertion d'un incident avec chaque priorité
-- (Décommentez pour tester)
/*
INSERT INTO incidents (id, type, description, reported_by, statut, priorite, service, lieu)
VALUES 
    (UUID(), 'test', 'Test faible', (SELECT id FROM profiles LIMIT 1), 'nouveau', 'faible', 'entretien', 'Test'),
    (UUID(), 'test', 'Test moyenne', (SELECT id FROM profiles LIMIT 1), 'nouveau', 'moyenne', 'entretien', 'Test'),
    (UUID(), 'test', 'Test haute', (SELECT id FROM profiles LIMIT 1), 'nouveau', 'haute', 'entretien', 'Test'),
    (UUID(), 'test', 'Test critique', (SELECT id FROM profiles LIMIT 1), 'nouveau', 'critique', 'entretien', 'Test');

-- Vérifier les valeurs insérées
SELECT id, priorite, description FROM incidents WHERE type = 'test';
*/



