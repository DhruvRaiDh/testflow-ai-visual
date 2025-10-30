import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlayCircle, Loader2, CheckCircle2, XCircle, Code, FolderOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProject } from "@/contexts/ProjectContext";
import { useLocation, useSearchParams } from "react-router-dom";

interface Script {
  id: string;
  name: string;
  description?: string;
}

const VisualTest = () => {
  const [loading, setLoading] = useState(false);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedScriptId, setSelectedScriptId] = useState("");
  const [testResult, setTestResult] = useState<{ status: string; output: string } | null>(null);
  const { toast } = useToast();
  const { activeProjectId, activeProject } = useProject();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (activeProjectId) {
      fetchScripts();
    }
  }, [activeProjectId]);

  useEffect(() => {
    // Pre-select script if passed from TestScripts page
    const scriptIdFromUrl = searchParams.get("scriptId");
    const scriptFromState = location.state?.script;
    
    if (scriptIdFromUrl) {
      setSelectedScriptId(scriptIdFromUrl);
    } else if (scriptFromState) {
      setSelectedScriptId(scriptFromState.id);
    }
  }, [searchParams, location.state]);

  const fetchScripts = async () => {
    if (!activeProjectId) return;
    
    try {
      const { data, error } = await supabase
        .from("scripts")
        .select("id, name, description")
        .eq("project_id", activeProjectId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      setScripts(data || []);
    } catch (error) {
      console.error("Error fetching scripts:", error);
    }
  };

  const handleRunTest = async () => {
    if (!selectedScriptId || !activeProjectId) {
      toast({
        title: "Missing Information",
        description: "Please select a test script and ensure a project is active.",
        variant: "destructive"
      });
      return;
    }

    const selectedScript = scripts.find(s => s.id === selectedScriptId);
    if (!selectedScript) return;

    setLoading(true);
    setTestResult(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/run-simulation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({ 
          scriptId: selectedScriptId,
          scriptName: selectedScript.name,
          projectId: activeProjectId,
          userId: "anonymous" // In production, this would be from auth context
        })
      });

      const data = await response.json();
      setTestResult(data);

      toast({
        title: data.status === "pass" ? "Test Passed" : "Test Failed",
        description: data.status === "pass" 
          ? "The test completed successfully." 
          : "The test encountered errors.",
        variant: data.status === "pass" ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Execution Failed",
        description: "Failed to run the test. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Visual Test Runner</h1>
          <p className="text-muted-foreground">
            {activeProject ? `Project: ${activeProject.name}` : "Select a project to run tests"}
          </p>
        </div>

        {!activeProjectId ? (
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center h-64">
              <FolderOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Please select a project from the navigation</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Test Configuration */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <PlayCircle className="h-5 w-5 text-primary" />
                  Test Configuration
                </CardTitle>
                <CardDescription>Select and run your test scripts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Select Test Script</label>
                  <Select value={selectedScriptId} onValueChange={setSelectedScriptId}>
                    <SelectTrigger className="bg-muted/50 border-border text-foreground">
                      <SelectValue placeholder="Choose a test script" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {scripts.map((script) => (
                        <SelectItem key={script.id} value={script.id} className="text-foreground">
                          {script.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <h3 className="text-sm font-medium text-foreground mb-2">Configuration</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Browser:</span>
                      <span className="text-foreground">Chrome (Visible)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Environment:</span>
                      <span className="text-foreground">Production</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Timeout:</span>
                      <span className="text-foreground">30s</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleRunTest}
                  disabled={loading || !selectedScriptId}
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running Test...
                    </>
                  ) : (
                    <>
                      <PlayCircle className="mr-2 h-4 w-4" />
                      Execute Test
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Test Results */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Code className="h-5 w-5 text-secondary" />
                  Test Results
                </CardTitle>
                <CardDescription>Execution output and logs</CardDescription>
              </CardHeader>
              <CardContent>
                {testResult ? (
                  <div className="space-y-4">
                    {/* Status Badge */}
                    <div className={`p-4 rounded-lg border-2 ${
                      testResult.status === "pass" 
                        ? "border-success bg-success/10" 
                        : "border-destructive bg-destructive/10"
                    }`}>
                      <div className="flex items-center gap-3">
                        {testResult.status === "pass" ? (
                          <CheckCircle2 className="h-6 w-6 text-success" />
                        ) : (
                          <XCircle className="h-6 w-6 text-destructive" />
                        )}
                        <div>
                          <p className={`font-bold text-lg ${
                            testResult.status === "pass" ? "text-success" : "text-destructive"
                          }`}>
                            {testResult.status === "pass" ? "TEST PASSED" : "TEST FAILED"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {testResult.status === "pass" 
                              ? "All assertions passed successfully" 
                              : "Test encountered errors"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Output Logs */}
                    <div className="rounded-lg bg-muted/50 border border-border p-4 max-h-[400px] overflow-y-auto">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Console Output</p>
                      <pre className="text-sm text-foreground font-mono whitespace-pre-wrap">
                        {testResult.output}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                    <div className="text-center">
                      <Code className="h-12 w-12 mx-auto mb-4 text-primary/50" />
                      <p>Test results will appear here after execution</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualTest;
