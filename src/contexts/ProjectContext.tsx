import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Project {
  id: string;
  name: string;
  description: string | null;
}

interface ProjectContextType {
  projects: Project[];
  activeProjectId: string | null;
  setActiveProjectId: (id: string) => void;
  activeProject: Project | null;
  loading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProjects(data || []);
      
      // Set first project as active if none selected
      if (data && data.length > 0 && !activeProjectId) {
        const savedProjectId = localStorage.getItem("activeProjectId");
        const projectToSet = savedProjectId && data.find(p => p.id === savedProjectId)
          ? savedProjectId
          : data[0].id;
        setActiveProjectId(projectToSet);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      toast({
        title: "Failed to Load Projects",
        description: "Could not retrieve projects. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetActiveProjectId = (id: string) => {
    setActiveProjectId(id);
    localStorage.setItem("activeProjectId", id);
  };

  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProjectId,
        setActiveProjectId: handleSetActiveProjectId,
        activeProject,
        loading
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
};
