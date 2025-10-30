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

    const { scriptId, scriptName, projectId, userId = "anonymous" } = await req.json();

    if (!scriptId || !scriptName || !projectId) {
      return new Response(
        JSON.stringify({ error: "scriptId, scriptName, and projectId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Starting execution for script: ${scriptName}, project: ${projectId}`);

    // Create pending execution record
    const startTime = Date.now();
    const { data: execution, error: createError } = await supabase
      .from("executions")
      .insert({
        user_id: userId,
        project_id: projectId,
        script_id: scriptId,
        script_name: scriptName,
        status: "running"
      })
      .select()
      .single();

    if (createError) {
      console.error("Failed to create execution record:", createError);
      throw createError;
    }

    console.log(`Created execution record: ${execution.id}`);

    // NOTE: Actual Python script execution would require a separate Node.js backend
    // This is a mock implementation showing the expected API structure
    
    // Simulate test execution with mock results
    const mockSuccess = Math.random() > 0.3; // 70% success rate
    const duration = Math.floor(Math.random() * 3000) + 1000; // 1-4 seconds

    const output = mockSuccess 
      ? `Test Execution Log:
==================
[INFO] Starting test: ${scriptName}
[INFO] Browser: Chrome (visible mode)
[INFO] Initializing Selenium WebDriver...
[SUCCESS] WebDriver initialized successfully
[INFO] Navigating to test URL...
[SUCCESS] Page loaded successfully
[INFO] Executing test steps...
[SUCCESS] Step 1: Element located and clicked
[SUCCESS] Step 2: Form filled with test data
[SUCCESS] Step 3: Submit button clicked
[SUCCESS] Step 4: Verification passed - Expected element found
[INFO] Taking screenshot...
[SUCCESS] Screenshot saved: ${scriptName.replace('.py', '_result.png')}
[INFO] Closing browser...
==================
TEST PASSED - All assertions successful
Execution time: ${(duration / 1000).toFixed(1)} seconds`
      : `Test Execution Log:
==================
[INFO] Starting test: ${scriptName}
[INFO] Browser: Chrome (visible mode)
[INFO] Initializing Selenium WebDriver...
[SUCCESS] WebDriver initialized successfully
[INFO] Navigating to test URL...
[SUCCESS] Page loaded successfully
[INFO] Executing test steps...
[SUCCESS] Step 1: Element located and clicked
[SUCCESS] Step 2: Form filled with test data
[ERROR] Step 3: Element not found - Timeout waiting for submit button
[TRACEBACK] selenium.common.exceptions.TimeoutException: Message: 
    at wait_for_element (${scriptName}:45)
    at execute_test (${scriptName}:78)
[INFO] Taking screenshot of failure state...
[SUCCESS] Screenshot saved: ${scriptName.replace('.py', '_error.png')}
[INFO] Closing browser...
==================
TEST FAILED - See error details above
Execution time: ${(duration / 1000).toFixed(1)} seconds`;

    // Update execution record with results
    const { error: updateError } = await supabase
      .from("executions")
      .update({
        status: mockSuccess ? "pass" : "fail",
        output: output,
        exit_code: mockSuccess ? 0 : 1,
        duration_ms: duration,
        completed_at: new Date().toISOString()
      })
      .eq("id", execution.id);

    if (updateError) {
      console.error("Failed to update execution record:", updateError);
    }

    console.log(`Execution completed: ${mockSuccess ? "PASS" : "FAIL"}`);

    const result = {
      status: mockSuccess ? "pass" : "fail",
      output: output,
      executionId: execution.id
    };

    return new Response(
      JSON.stringify(result),
      { 
        status: mockSuccess ? 200 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in run-simulation function:", error);
    return new Response(
      JSON.stringify({ 
        status: "fail",
        output: `Error: ${error instanceof Error ? error.message : "Unknown error"}` 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
