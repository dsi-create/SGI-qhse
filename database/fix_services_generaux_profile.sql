-- =============================================================================
-- Lier Auth ↔ profiles pour services.generaux@hospital.com
-- Exécuter dans Supabase SQL Editor
-- =============================================================================

-- 1) Diagnostic : voir si Auth et profiles sont liés
SELECT
  u.id AS auth_id,
  u.email AS auth_email,
  p.id AS profile_id,
  p.username,
  p.role,
  p.service
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'services.generaux@hospital.com';

-- 2) Si profile_id est NULL ou role vide → créer / corriger le profil
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
  u.id,
  'services.generaux',
  u.email,
  'Responsable',
  'Services Généraux',
  'M.',
  'responsable_services_generaux'::public.user_role_type,
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

-- 3) Supprimer un éventuel doublon (même email mais mauvais id)
DELETE FROM public.profiles p
WHERE p.email = 'services.generaux@hospital.com'
  AND p.id NOT IN (
    SELECT id FROM auth.users WHERE email = 'services.generaux@hospital.com'
  );

-- 4) Vérification finale
SELECT id, username, email, role, service
FROM public.profiles
WHERE email = 'services.generaux@hospital.com';
