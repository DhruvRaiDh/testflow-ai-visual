import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, CheckCircle2, XCircle, Clock, Sparkles, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">TestFlow Pro</h1>
            <p className="text-muted-foreground">Automated Testing Made Intelligent</p>
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
              <div className="text-3xl font-bold text-foreground">248</div>
              <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:shadow-glow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Passed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-success">234</div>
              <p className="text-xs text-muted-foreground mt-1">94.4% success rate</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:shadow-glow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">14</div>
              <p className="text-xs text-muted-foreground mt-1">5.6% failure rate</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border hover:shadow-glow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Duration</CardTitle>
              <Clock className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">2.4s</div>
              <p className="text-xs text-muted-foreground mt-1">-0.3s improvement</p>
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
            <div className="space-y-4">
              {[
                { name: "Login Flow Test", status: "passed", duration: "1.8s", time: "2 minutes ago" },
                { name: "Checkout Process", status: "passed", duration: "3.2s", time: "15 minutes ago" },
                { name: "User Registration", status: "failed", duration: "2.1s", time: "1 hour ago" },
                { name: "Product Search", status: "passed", duration: "2.9s", time: "2 hours ago" },
              ].map((test, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                  <div className="flex items-center gap-4">
                    {test.status === "passed" ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <div>
                      <p className="font-medium text-foreground">{test.name}</p>
                      <p className="text-sm text-muted-foreground">{test.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{test.duration}</p>
                    <p className={`text-xs ${test.status === "passed" ? "text-success" : "text-destructive"}`}>
                      {test.status.toUpperCase()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
