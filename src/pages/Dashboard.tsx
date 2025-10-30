import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, CheckCircle2, XCircle, Clock, Sparkles, PlayCircle, Loader2, FolderOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useProject } from "@/contexts/ProjectContext";
import { useToast } from "@/hooks/use-toast";

interface DashboardMetrics {
  totalRuns: number;
  failedRuns: number;
  passedRuns: number;
  passRate: number;
  avgDuration: number;
  recentExecutions: Array<{
    id: string;
    scriptName: string;
    status: string;
    timestamp: string;
    duration: number;
  }>;
}

const Dashboard = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { activeProjectId, activeProject } = useProject();
  const { toast } = useToast();

  useEffect(() => {
    if (activeProjectId) {
      fetchMetrics();
    } else {
      setLoading(false);
    }
  }, [activeProjectId]);

  const fetchMetrics = async () => {
    if (!activeProjectId) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dashboard-metrics?projectId=${activeProjectId}&days=7`,
        {
          headers: {
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`
          }
        }
      );

      if (!response.ok) throw new Error("Failed to fetch metrics");

      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error("Error fetching metrics:", error);
      toast({
        title: "Failed to Load Metrics",
        description: "Could not retrieve dashboard data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (ms: number) => {
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  if (!activeProjectId) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center h-96">
              <FolderOpen className="h-20 w-20 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">No Project Selected</h2>
              <p className="text-muted-foreground text-center max-w-md">
                Please select a project from the navigation bar to view your test metrics and analytics.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="bg-card border-border">
            <CardContent className="flex items-center justify-center h-96">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">TestFlow Pro</h1>
            <p className="text-muted-foreground">
              {activeProject ? `Project: ${activeProject.name}` : "Automated Testing Made Intelligent"}
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/ai-generator">
              <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
                <Sparkles className="mr-2 h-4 w-4" />
                AI Test Generator
              </Button>
            </Link>
            <Link to="/visual-test">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                <PlayCircle className="mr-2 h-4 w-4" />
                Run Test
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-card border-border hover:shadow-glow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Tests</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{metrics?.totalRuns || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:shadow-glow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Passed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">{metrics?.passedRuns || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">{metrics?.passRate || 0}% success rate</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:shadow-glow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{metrics?.failedRuns || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics?.totalRuns ? ((metrics.failedRuns / metrics.totalRuns) * 100).toFixed(1) : 0}% failure rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:shadow-glow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Duration</CardTitle>
              <Clock className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {metrics?.avgDuration ? formatDuration(metrics.avgDuration) : "0s"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Average execution time</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tests */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Test Executions</CardTitle>
            <CardDescription>Latest automated test runs</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics?.recentExecutions && metrics.recentExecutions.length > 0 ? (
              <div className="space-y-4">
                {metrics.recentExecutions.map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex items-center gap-4">
                      {test.status === "pass" ? (
                        <CheckCircle2 className="h-5 w-5 text-success" />
                      ) : (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                      <div>
                        <p className="font-medium text-foreground">{test.scriptName}</p>
                        <p className="text-sm text-muted-foreground">{formatTimeAgo(test.timestamp)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{formatDuration(test.duration)}</p>
                      <p className={`text-xs ${test.status === "pass" ? "text-success" : "text-destructive"}`}>
                        {test.status.toUpperCase()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>No test executions yet</p>
                <p className="text-sm mt-2">Run your first test to see results here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
