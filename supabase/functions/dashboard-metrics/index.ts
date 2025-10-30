import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get projectId and optional date range from query params
    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId");
    const days = parseInt(url.searchParams.get("days") || "7");

    if (!projectId) {
      return new Response(
        JSON.stringify({ error: "projectId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Fetching metrics for project: ${projectId}, last ${days} days`);

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Fetch executions for the project within date range
    const { data: executions, error } = await supabase
      .from("executions")
      .select("id, status, started_at, duration_ms, script_name")
      .eq("project_id", projectId)
      .gte("started_at", startDate.toISOString())
      .order("started_at", { ascending: true });

    if (error) {
      console.error("Database error:", error);
      throw error;
    }

    console.log(`Found ${executions?.length || 0} executions`);

    // Calculate metrics
    const totalRuns = executions?.length || 0;
    const failedRuns = executions?.filter(e => e.status === "fail").length || 0;
    const passedRuns = executions?.filter(e => e.status === "pass").length || 0;
    const passRate = totalRuns > 0 ? Math.round((passedRuns / totalRuns) * 100) : 0;
    const avgDuration = executions?.length 
      ? Math.round(executions.reduce((sum, e) => sum + (e.duration_ms || 0), 0) / executions.length)
      : 0;

    // Group by date for chart data
    const executionsByDate = executions?.reduce((acc: any, exec) => {
      const date = new Date(exec.started_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, passed: 0, failed: 0, total: 0 };
      }
      acc[date].total++;
      if (exec.status === "pass") acc[date].passed++;
      if (exec.status === "fail") acc[date].failed++;
      return acc;
    }, {});

    const chartData = Object.values(executionsByDate || {});

    // Recent executions (last 10)
    const recentExecutions = executions?.slice(-10).reverse().map(e => ({
      id: e.id,
      scriptName: e.script_name,
      status: e.status,
      timestamp: e.started_at,
      duration: e.duration_ms
    })) || [];

    const metrics = {
      totalRuns,
      failedRuns,
      passedRuns,
      passRate,
      avgDuration,
      chartData,
      recentExecutions
    };

    console.log("Metrics calculated:", { totalRuns, failedRuns, passRate });

    return new Response(JSON.stringify(metrics), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in dashboard-metrics function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
