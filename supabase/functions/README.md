# Supabase Edge Functions

## create-user

Crée un utilisateur via l’API Auth Admin (`email_confirm: true`) **sans envoyer d’e-mail**, pour éviter le rate limit Supabase.

- **Body** : `{ email, password, username, first_name, last_name, role, service, civility, pin? }`
- **Auth** : `Authorization: Bearer <session_jwt>`
- **Rôles autorisés** : `superadmin`, `superviseur_qhse`, `responsable_services_generaux`

```powershell
supabase functions deploy create-user
```

## reset-user-password

Permet à un administrateur (rôle `superadmin`) de réinitialiser le mot de passe d’un autre utilisateur via l’API Auth Admin (service role).

- **Body** : `{ userId: string, newPassword: string }`
- **Auth** : header `Authorization: Bearer <session_jwt>` (envoyé automatiquement par `supabase.functions.invoke()` côté frontend).
- **Contrôle** : vérification du rôle `superadmin` dans la table `profiles`.

### Déploiement

À la racine du projet, avec [Supabase CLI](https://supabase.com/docs/guides/cli) installée et connectée :

```powershell
supabase login
supabase link --project-ref VOTRE_PROJECT_REF
supabase functions deploy reset-user-password
supabase functions deploy create-user
```

Les secrets `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` sont fournis automatiquement par le projet Supabase.
