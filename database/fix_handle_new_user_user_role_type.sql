-- =============================================================================
-- Corriger le trigger Auth -> profiles
-- Compatible avec profiles.id en TEXT et profiles.role en TEXT
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  role_value TEXT := NULLIF(new.raw_user_meta_data ->> 'role', '');
  civility_value TEXT := NULLIF(new.raw_user_meta_data ->> 'civility', '');
BEGIN
  IF role_value IS NULL THEN
    role_value := 'employe';
  END IF;

  IF civility_value IS NULL THEN
    civility_value := 'M.';
  END IF;

  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    email,
    service,
    username,
    civility,
    pin,
    role
  )
  VALUES (
    new.id::text,
    COALESCE(NULLIF(new.raw_user_meta_data ->> 'first_name', ''), 'Utilisateur'),
    COALESCE(NULLIF(new.raw_user_meta_data ->> 'last_name', ''), 'Nouveau'),
    new.email,
    COALESCE(NULLIF(new.raw_user_meta_data ->> 'service', ''), 'Non renseigné'),
    COALESCE(NULLIF(new.raw_user_meta_data ->> 'username', ''), split_part(new.email, '@', 1)),
    civility_value,
    NULLIF(new.raw_user_meta_data ->> 'pin', ''),
    role_value
  )
  ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    service = EXCLUDED.service,
    username = EXCLUDED.username,
    civility = EXCLUDED.civility,
    pin = EXCLUDED.pin,
    role = EXCLUDED.role;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
