import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Nicht autorisiert" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the calling user is an admin
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: callingUser }, error: userError } = await userClient.auth.getUser();
    if (userError || !callingUser) {
      console.error("User verification failed:", userError);
      return new Response(
        JSON.stringify({ success: false, error: "Benutzer konnte nicht verifiziert werden" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if calling user has admin role
    const { data: roleData, error: roleError } = await userClient
      .from("user_roles")
      .select("role")
      .eq("user_id", callingUser.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      console.error("Admin check failed:", roleError);
      return new Response(
        JSON.stringify({ success: false, error: "Keine Admin-Berechtigung" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create admin client with service role key to list all users
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Get all auth users
    const { data: { users }, error: usersError } = await adminClient.auth.admin.listUsers();
    if (usersError) {
      console.error("Failed to list users:", usersError);
      return new Response(
        JSON.stringify({ success: false, error: "Benutzer konnten nicht geladen werden" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get all traveler profiles without user_id
    const { data: profiles, error: profilesError } = await adminClient
      .from("traveler_profiles")
      .select("id, first_name, last_name, user_id, phone_number");

    if (profilesError) {
      console.error("Failed to load profiles:", profilesError);
      return new Response(
        JSON.stringify({ success: false, error: "Profile konnten nicht geladen werden" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Build email to auth user map
    const emailToUserMap = new Map<string, { id: string; email: string }>();
    for (const user of users) {
      if (user.email) {
        emailToUserMap.set(user.email.toLowerCase(), { id: user.id, email: user.email });
      }
    }

    // Sync results
    const results = {
      synced: [] as { profileId: string; name: string; userId: string; email: string }[],
      alreadyLinked: [] as { profileId: string; name: string; userId: string }[],
      noMatch: [] as { profileId: string; name: string }[],
      errors: [] as string[],
    };

    // Process each profile
    for (const profile of profiles || []) {
      const fullName = `${profile.first_name} ${profile.last_name}`;

      // Check if already linked
      if (profile.user_id) {
        results.alreadyLinked.push({
          profileId: profile.id,
          name: fullName,
          userId: profile.user_id,
        });
        continue;
      }

      // Try to match by known email patterns
      // Since traveler_profiles doesn't have email, we need to match by name
      // Look for auth users where the email might contain the name
      let matchedUser: { id: string; email: string } | null = null;

      // Common email patterns to try
      const firstName = profile.first_name?.toLowerCase() || "";
      const lastName = profile.last_name?.toLowerCase() || "";
      
      // Search through all users for potential matches
      for (const [email, user] of emailToUserMap) {
        const emailLower = email.toLowerCase();
        
        // Match criteria:
        // 1. Email contains first name AND last name
        // 2. Email starts with first name
        // 3. Email starts with last name
        const containsBothNames = emailLower.includes(firstName) && emailLower.includes(lastName);
        const startsWithFirstName = firstName && emailLower.split("@")[0].startsWith(firstName);
        const containsFullName = firstName && lastName && 
          (emailLower.includes(`${firstName}${lastName}`) || 
           emailLower.includes(`${firstName}.${lastName}`) ||
           emailLower.includes(`${lastName}${firstName}`) ||
           emailLower.includes(`${lastName}.${firstName}`));

        if (containsBothNames || containsFullName || (startsWithFirstName && emailLower.includes(lastName))) {
          matchedUser = user;
          break;
        }
      }

      if (matchedUser) {
        // Update the profile with the user_id
        const { error: updateError } = await adminClient
          .from("traveler_profiles")
          .update({ user_id: matchedUser.id })
          .eq("id", profile.id);

        if (updateError) {
          console.error(`Failed to update profile ${profile.id}:`, updateError);
          results.errors.push(`Fehler bei ${fullName}: ${updateError.message}`);
        } else {
          console.log(`Synced profile ${profile.id} (${fullName}) to user ${matchedUser.id} (${matchedUser.email})`);
          results.synced.push({
            profileId: profile.id,
            name: fullName,
            userId: matchedUser.id,
            email: matchedUser.email,
          });
        }
      } else {
        results.noMatch.push({
          profileId: profile.id,
          name: fullName,
        });
      }
    }

    // Also return list of all users for the UI
    const allUsers = users.map(u => ({
      id: u.id,
      email: u.email || "",
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        results,
        allUsers,
        totalProfiles: profiles?.length || 0,
        totalAuthUsers: users.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unbekannter Fehler";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
