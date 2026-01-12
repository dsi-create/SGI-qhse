-- =====================================================
-- AJOUT DU CHAMP assignee_name À LA TABLE planned_tasks
-- =====================================================
USE hospital_management;

ALTER TABLE planned_tasks
ADD COLUMN assignee_name VARCHAR(255) NULL AFTER assigned_to;

-- Vérification
DESCRIBE planned_tasks;


