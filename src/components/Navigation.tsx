import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, Sparkles, PlayCircle, FileCode, FolderOpen } from "lucide-react";
import { useProject } from "@/contexts/ProjectContext";

const Navigation = () => {
  const location = useLocation();
  const { projects, activeProjectId, setActiveProjectId, loading } = useProject();

  const navItems = [
    { path: "/", icon: Home, label: "Dashboard" },
    { path: "/ai-generator", icon: Sparkles, label: "AI Generator" },
    { path: "/visual-test", icon: PlayCircle, label: "Run Test" },
    { path: "/test-scripts", icon: FileCode, label: "Scripts" },
  ];

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">TestFlow Pro</span>
          </Link>

          <div className="flex items-center gap-6">
            {/* Project Selector */}
            <div className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <Select
                value={activeProjectId || ""}
                onValueChange={setActiveProjectId}
                disabled={loading || projects.length === 0}
              >
                <SelectTrigger className="w-[220px] bg-muted/50 border-border text-foreground">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {projects.map((project) => (
                    <SelectItem 
                      key={project.id} 
                      value={project.id}
                      className="text-foreground"
                    >
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Navigation Items */}
            <div className="flex gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link key={item.path} to={item.path}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={
                        isActive
                          ? "bg-primary/20 text-primary hover:bg-primary/30"
                          : "text-muted-foreground hover:text-foreground"
                      }
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
