import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const CREATOR_ROLES = ["superadmin", "superviseur_qhse", "responsable_services_generaux"];

function jsonResponse(
  body: { success: boolean; message: string; user?: unknown; details?: unknown },
  status: number,
) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return jsonResponse({ success: false, message: "Authorization header (Bearer token) required." }, 401);
    }

    const token = authHeader.slice(7);
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      return jsonResponse(
        { success: false, message: "Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY." },
        500,
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

    const {
      data: { user: requester },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !requester) {
      return jsonResponse({ success: false, message: "Invalid or expired token.", details: authError }, 401);
    }

    const { data: requesterProfile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", requester.id)
      .maybeSingle();

    if (profileError || !requesterProfile) {
      return jsonResponse(
        {
          success: false,
          message: "Profil du demandeur introuvable. Reconnectez-vous ou corrigez la ligne profiles liée à ce compte.",
          details: profileError,
        },
        403,
      );
    }

    const requesterRole = (requesterProfile.role as string) ?? "";
    if (!CREATOR_ROLES.includes(requesterRole)) {
      return jsonResponse(
        {
          success: false,
          message: `Vous n'êtes pas autorisé à créer des utilisateurs (rôle actuel : ${requesterRole || "vide"}).`,
        },
        403,
      );
    }

    let body: {
      email?: string;
      password?: string;
      username?: string;
      first_name?: string;
      last_name?: string;
      role?: string;
      service?: string;
      civility?: string;
      pin?: string | null;
    };

    try {
      body = await req.json();
    } catch {
      return jsonResponse({ success: false, message: "Invalid JSON body." }, 400);
    }

    const { email, password, username, first_name, last_name, role, service, civility, pin } = body;

    if (!email || !password || !username || !first_name || !last_name || !role || !service || !civility) {
      return jsonResponse(
        { success: false, message: "Champs requis manquants (email, password, username, first_name, last_name, role, service, civility)." },
        400,
      );
    }

    if (password.length < 6) {
      return jsonResponse({ success: false, message: "Le mot de passe doit contenir au moins 6 caractères." }, 400);
    }

    // Création Admin : email déjà confirmé → aucun e-mail envoyé (évite le rate limit)
    const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: email.toLowerCase().trim(),
      password,
      email_confirm: true,
      user_metadata: {
        username,
        first_name,
        last_name,
        role,
        service,
        civility,
        pin: role === "medecin" ? pin ?? null : null,
      },
    });

    if (createError || !created.user) {
      return jsonResponse(
        { success: false, message: createError?.message || "Échec de la création Auth.", details: createError },
        400,
      );
    }

    const userId = created.user.id;

    const { error: insertError } = await supabaseAdmin.from("profiles").upsert(
      {
        id: userId,
        username,
        first_name,
        last_name,
        email: email.toLowerCase().trim(),
        role,
        service,
        civility,
        pin: role === "medecin" ? pin ?? null : null,
      },
      { onConflict: "id" },
    );

    if (insertError) {
      // Rollback auth user if profile insert fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return jsonResponse({ success: false, message: insertError.message }, 400);
    }

    const { data: profile, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (fetchError || !profile) {
      return jsonResponse({ success: false, message: "Profil créé mais introuvable." }, 500);
    }

    return jsonResponse(
      {
        success: true,
        message: "Utilisateur créé avec succès.",
        user: profile,
      },
      200,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    console.error("create-user error:", message);
    return jsonResponse({ success: false, message }, 500);
  }
});
