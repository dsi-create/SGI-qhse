-- Supabase : la contrainte CHECK profiles_role_check bloque encore
-- les nouveaux rôles, alors que l'ENUM user_role_type les autorise déjà.
-- L'ENUM suffit : on retire le CHECK.

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Si le nom exact est différent, cette requête le trouve et le supprime :
DO $$
DECLARE
  cname text;
BEGIN
  SELECT con.conname INTO cname
  FROM pg_constraint con
  JOIN pg_attribute att
    ON att.attrelid = con.conrelid
   AND att.attnum = ANY (con.conkey)
  WHERE con.conrelid = 'public.profiles'::regclass
    AND con.contype = 'c'
    AND att.attname = 'role'
  LIMIT 1;

  IF cname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', cname);
  END IF;
END $$;

-- Vérification : plus aucune CHECK sur profiles.role
SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass
  AND contype = 'c';
