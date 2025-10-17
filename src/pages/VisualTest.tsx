import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlayCircle, Loader2, CheckCircle2, XCircle, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const VisualTest = () => {
  const [loading, setLoading] = useState(false);
  const [selectedScript, setSelectedScript] = useState("");
  const [testResult, setTestResult] = useState<{ status: string; output: string } | null>(null);
  const { toast } = useToast();

  const scripts = [
    { id: "s1", name: "login_test.py" },
    { id: "s2", name: "checkout_flow.py" },
    { id: "s3", name: "user_registration.py" },
    { id: "s4", name: "search_functionality.py" },
  ];

  const handleRunTest = async () => {
    if (!selectedScript) {
      toast({
        title: "No Script Selected",
        description: "Please select a test script to run.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setTestResult(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/run-simulation`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({ scriptName: selectedScript })
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
          <p className="text-muted-foreground">Execute Selenium tests with browser visibility</p>
        </div>

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
                <Select value={selectedScript} onValueChange={setSelectedScript}>
                  <SelectTrigger className="bg-muted/50 border-border text-foreground">
                    <SelectValue placeholder="Choose a test script" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {scripts.map((script) => (
                      <SelectItem key={script.id} value={script.name} className="text-foreground">
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
                disabled={loading || !selectedScript}
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
      </div>
    </div>
  );
};

export default VisualTest;
