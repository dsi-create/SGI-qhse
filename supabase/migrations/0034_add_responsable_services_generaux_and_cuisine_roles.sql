-- profiles.role utilise l'ENUM public.user_role_type sur ce projet.

ALTER TYPE public.user_role_type ADD VALUE IF NOT EXISTS 'assistante_qhse';
ALTER TYPE public.user_role_type ADD VALUE IF NOT EXISTS 'biomedical';
ALTER TYPE public.user_role_type ADD VALUE IF NOT EXISTS 'dop';
ALTER TYPE public.user_role_type ADD VALUE IF NOT EXISTS 'buandiere';
ALTER TYPE public.user_role_type ADD VALUE IF NOT EXISTS 'employe';
ALTER TYPE public.user_role_type ADD VALUE IF NOT EXISTS 'technicien_polyvalent';
ALTER TYPE public.user_role_type ADD VALUE IF NOT EXISTS 'administrateur_reseau';
ALTER TYPE public.user_role_type ADD VALUE IF NOT EXISTS 'responsable_services_generaux';
ALTER TYPE public.user_role_type ADD VALUE IF NOT EXISTS 'cuisine';
