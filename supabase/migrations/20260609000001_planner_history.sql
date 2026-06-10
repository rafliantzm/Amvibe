-- Migration for Planner History

CREATE TABLE public.planner_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  agent_name VARCHAR NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) Setup
ALTER TABLE public.planner_versions ENABLE ROW LEVEL SECURITY;

-- Policies
-- Users can CRUD planner versions for their own projects
CREATE POLICY "Users CRUD own planner versions" ON public.planner_versions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = planner_versions.project_id AND owner_id = auth.uid())
  );
