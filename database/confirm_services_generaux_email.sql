-- =============================================================================
-- Confirmer l'e-mail Auth de services.generaux@hospital.com
-- Exécuter dans Supabase → SQL Editor
-- =============================================================================

UPDATE auth.users
SET email_confirmed_at = COALESCE(email_confirmed_at, now())
WHERE email = 'services.generaux@hospital.com';

-- Vérification (email_confirmed_at ne doit plus être NULL)
SELECT id, email, email_confirmed_at
FROM auth.users
WHERE email = 'services.generaux@hospital.com';
