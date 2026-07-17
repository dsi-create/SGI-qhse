-- =============================================================================
-- 1) Diagnostic : quel type / contrainte pour profiles.role ?
-- =============================================================================
SELECT
  c.column_name,
  c.data_type,
  c.udt_name,
  c.is_nullable
FROM information_schema.columns c
WHERE c.table_schema = 'public'
  AND c.table_name = 'profiles'
  AND c.column_name = 'role';

SELECT t.typname AS enum_name, e.enumlabel AS value
FROM pg_type t
JOIN pg_enum e ON e.enumtypid = t.oid
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = 'public'
  AND t.typname ILIKE '%role%'
ORDER BY t.typname, e.enumsortorder;

SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass
  AND contype = 'c';

-- =============================================================================
-- 2) Après le diagnostic :
--    - si udt_name = user_role      → utilisez le bloc A
--    - si udt_name = user_role_type → utilisez le bloc B
--    - si data_type = character varying / text → utilisez le bloc C
-- =============================================================================

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- ----- BLOC A (user_role) -----
/*
INSERT INTO public.profiles (id, username, email, first_name, last_name, civility, role, service)
SELECT u.id::text, 'services.generaux', u.email, 'Responsable', 'Services Généraux', 'M.',
       'responsable_services_generaux'::public.user_role, 'Services Généraux'
FROM auth.users u
WHERE u.email = 'services.generaux@hospital.com'
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username, role = EXCLUDED.role, service = EXCLUDED.service,
  first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, civility = EXCLUDED.civility;
*/

-- ----- BLOC B (user_role_type) -----
/*
INSERT INTO public.profiles (id, username, email, first_name, last_name, civility, role, service)
SELECT u.id::text, 'services.generaux', u.email, 'Responsable', 'Services Généraux', 'M.',
       'responsable_services_generaux'::public.user_role_type, 'Services Généraux'
FROM auth.users u
WHERE u.email = 'services.generaux@hospital.com'
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username, role = EXCLUDED.role, service = EXCLUDED.service,
  first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, civility = EXCLUDED.civility;
*/

-- ----- BLOC C (texte / varchar) -----
/*
INSERT INTO public.profiles (id, username, email, first_name, last_name, civility, role, service)
SELECT u.id::text, 'services.generaux', u.email, 'Responsable', 'Services Généraux', 'M.',
       'responsable_services_generaux', 'Services Généraux'
FROM auth.users u
WHERE u.email = 'services.generaux@hospital.com'
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username, role = EXCLUDED.role, service = EXCLUDED.service,
  first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, civility = EXCLUDED.civility;
*/

-- Vérification
-- SELECT id, username, email, role, service FROM public.profiles
-- WHERE email = 'services.generaux@hospital.com';
