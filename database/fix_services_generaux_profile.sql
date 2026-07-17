-- =============================================================================
-- Lier Auth ↔ profiles pour services.generaux@hospital.com
-- Compatible : profiles.id TEXT, profiles.role TEXT
-- =============================================================================

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 1) Diagnostic
SELECT
  u.id AS auth_id,
  u.email AS auth_email,
  p.id AS profile_id,
  p.username,
  p.role,
  p.service
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id::text
WHERE u.email = 'services.generaux@hospital.com';

-- 2) Créer / corriger le profil
INSERT INTO public.profiles (
  id,
  username,
  email,
  first_name,
  last_name,
  civility,
  role,
  service
)
SELECT
  u.id::text,
  'services.generaux',
  u.email,
  'Responsable',
  'Services Généraux',
  'M.',
  'responsable_services_generaux',
  'Services Généraux'
FROM auth.users u
WHERE u.email = 'services.generaux@hospital.com'
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  civility = EXCLUDED.civility,
  role = EXCLUDED.role,
  service = EXCLUDED.service;

-- 3) Supprimer doublons orphelins
DELETE FROM public.profiles p
WHERE p.email = 'services.generaux@hospital.com'
  AND p.id NOT IN (
    SELECT id::text FROM auth.users WHERE email = 'services.generaux@hospital.com'
  );

-- 4) Vérification
SELECT id, username, email, role, service
FROM public.profiles
WHERE email = 'services.generaux@hospital.com';
