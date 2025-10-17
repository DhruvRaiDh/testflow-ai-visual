import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Mock list of test scripts
    const scripts = [
      { id: "s1", name: "login_test.py" },
      { id: "s2", name: "checkout_flow.py" },
      { id: "s3", name: "user_registration.py" },
      { id: "s4", name: "search_functionality.py" },
      { id: "s5", name: "profile_update.py" },
      { id: "s6", name: "password_reset.py" }
    ];

    return new Response(
      JSON.stringify(scripts),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in test-scripts function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
