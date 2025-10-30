-- Create projects table (replaces /artifacts/{app_id}/public/projects)
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scripts table (replaces /artifacts/{app_id}/public/projects/{projectId}/scripts)
CREATE TABLE public.scripts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, name)
);

-- Create executions table (replaces /artifacts/{app_id}/users/{userId}/executions)
CREATE TABLE public.executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  script_id UUID NOT NULL REFERENCES public.scripts(id) ON DELETE CASCADE,
  script_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  output TEXT,
  exit_code INTEGER,
  duration_ms INTEGER,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'running', 'pass', 'fail'))
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.executions ENABLE ROW LEVEL SECURITY;

-- Projects: Everyone can view, but restrict creation/updates (for now, fully open)
CREATE POLICY "Projects are viewable by everyone"
  ON public.projects FOR SELECT
  USING (true);

CREATE POLICY "Projects can be created by anyone"
  ON public.projects FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Projects can be updated by anyone"
  ON public.projects FOR UPDATE
  USING (true);

CREATE POLICY "Projects can be deleted by anyone"
  ON public.projects FOR DELETE
  USING (true);

-- Scripts: Everyone can view scripts for their project
CREATE POLICY "Scripts are viewable by everyone"
  ON public.scripts FOR SELECT
  USING (true);

CREATE POLICY "Scripts can be created by anyone"
  ON public.scripts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Scripts can be updated by anyone"
  ON public.scripts FOR UPDATE
  USING (true);

CREATE POLICY "Scripts can be deleted by anyone"
  ON public.scripts FOR DELETE
  USING (true);

-- Executions: Users can only see their own executions
CREATE POLICY "Users can view their own executions"
  ON public.executions FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own executions"
  ON public.executions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own executions"
  ON public.executions FOR UPDATE
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_scripts_project_id ON public.scripts(project_id);
CREATE INDEX idx_executions_user_id ON public.executions(user_id);
CREATE INDEX idx_executions_project_id ON public.executions(project_id);
CREATE INDEX idx_executions_script_id ON public.executions(script_id);
CREATE INDEX idx_executions_started_at ON public.executions(started_at DESC);

-- Trigger for updating updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scripts_updated_at
  BEFORE UPDATE ON public.scripts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.projects (name, description) VALUES
  ('E-Commerce Platform', 'Automated tests for the main shopping platform'),
  ('Admin Dashboard', 'Backend admin panel test suite'),
  ('Mobile API', 'API endpoint validation tests');

-- Get the project IDs for inserting scripts
DO $$
DECLARE
  ecommerce_id UUID;
  admin_id UUID;
  mobile_id UUID;
BEGIN
  SELECT id INTO ecommerce_id FROM public.projects WHERE name = 'E-Commerce Platform';
  SELECT id INTO admin_id FROM public.projects WHERE name = 'Admin Dashboard';
  SELECT id INTO mobile_id FROM public.projects WHERE name = 'Mobile API';

  INSERT INTO public.scripts (project_id, name, content, description) VALUES
    (ecommerce_id, 'login_test.py', 'from selenium import webdriver\n\n# Login test implementation', 'Validates user login flow'),
    (ecommerce_id, 'checkout_flow.py', 'from selenium import webdriver\n\n# Checkout test implementation', 'Tests complete checkout process'),
    (ecommerce_id, 'user_registration.py', 'from selenium import webdriver\n\n# Registration test implementation', 'Validates user registration'),
    (admin_id, 'search_functionality.py', 'from selenium import webdriver\n\n# Search test implementation', 'Tests search features'),
    (mobile_id, 'api_health_check.py', 'import requests\n\n# API health check implementation', 'Validates API health endpoints');
END $$;