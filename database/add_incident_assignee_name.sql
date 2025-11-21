-- =====================================================
-- AJOUT DE LA COLONNE assigned_to_name DANS incidents
-- =====================================================
USE hospital_management;

ALTER TABLE incidents
ADD COLUMN assigned_to_name VARCHAR(255) NULL AFTER assigned_to;

DESCRIBE incidents;





