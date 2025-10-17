import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileCode, PlayCircle, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

interface Script {
  id: string;
  name: string;
}

const TestScripts = () => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchScripts();
  }, []);

  const fetchScripts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/test-scripts`, {
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to fetch scripts");
      }

      const data = await response.json();
      setScripts(data);
    } catch (error) {
      toast({
        title: "Failed to Load Scripts",
        description: "Could not retrieve test scripts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Test Scripts Library</h1>
            <p className="text-muted-foreground">Manage and execute your automation scripts</p>
          </div>
          <Link to="/visual-test">
            <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
              <PlayCircle className="mr-2 h-4 w-4" />
              Run Test
            </Button>
          </Link>
        </div>

        {loading ? (
          <Card className="bg-card border-border">
            <CardContent className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scripts.map((script) => (
              <Card key={script.id} className="bg-card border-border hover:shadow-glow transition-all hover:scale-105">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <FileCode className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-foreground text-lg">{script.name}</CardTitle>
                      <CardDescription className="text-xs">Python Selenium Test</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Last run: 2 hours ago</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Link to="/visual-test" className="flex-1">
                      <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10">
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Execute
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestScripts;
