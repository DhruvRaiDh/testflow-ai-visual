import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TestStep {
  step_number: number;
  action: string;
  verification: string;
  data: string;
}

const AIGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [testCase, setTestCase] = useState<TestStep[] | null>(null);
  const [formData, setFormData] = useState({
    system: "",
    action: "",
    outcome: ""
  });
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!formData.system || !formData.action || !formData.outcome) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields to generate a test case.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-test-case`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error("Failed to generate test case");
      }

      const data = await response.json();
      setTestCase(data.testCase);
      toast({
        title: "Test Case Generated",
        description: "Your AI-powered test case has been created successfully.",
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate test case. Please try again.",
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
          <h1 className="text-4xl font-bold text-foreground mb-2">AI Test Case Generator</h1>
          <p className="text-muted-foreground">Generate comprehensive test cases using AI</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Form */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Sparkles className="h-5 w-5 text-primary" />
                Test Requirements
              </CardTitle>
              <CardDescription>Describe what you want to test</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="system" className="text-foreground">System/Feature</Label>
                <Input
                  id="system"
                  placeholder="e.g., User Authentication System"
                  value={formData.system}
                  onChange={(e) => setFormData({ ...formData, system: e.target.value })}
                  className="bg-muted/50 border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="action" className="text-foreground">User Action</Label>
                <Textarea
                  id="action"
                  placeholder="e.g., User attempts to log in with valid credentials"
                  value={formData.action}
                  onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                  className="bg-muted/50 border-border text-foreground min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="outcome" className="text-foreground">Expected Outcome</Label>
                <Textarea
                  id="outcome"
                  placeholder="e.g., User is successfully logged in and redirected to dashboard"
                  value={formData.outcome}
                  onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                  className="bg-muted/50 border-border text-foreground min-h-[100px]"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Test Case
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Test Case */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Generated Test Case</CardTitle>
              <CardDescription>AI-generated test steps</CardDescription>
            </CardHeader>
            <CardContent>
              {testCase ? (
                <div className="space-y-4">
                  {testCase.map((step) => (
                    <div key={step.step_number} className="p-4 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                          {step.step_number}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Action</p>
                            <p className="text-foreground font-medium">{step.action}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Verification</p>
                            <p className="text-foreground">{step.verification}</p>
                          </div>
                          {step.data && (
                            <div>
                              <p className="text-xs text-muted-foreground uppercase tracking-wide">Test Data</p>
                              <p className="text-secondary font-mono text-sm">{step.data}</p>
                            </div>
                          )}
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                  <div className="text-center">
                    <Sparkles className="h-12 w-12 mx-auto mb-4 text-primary/50" />
                    <p>Your generated test case will appear here</p>
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

export default AIGenerator;
