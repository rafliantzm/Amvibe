-- Initial Schema for Amvibe Enterprise

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table (Extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  status VARCHAR DEFAULT 'ACTIVE',
  last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Configurations (For Admin Dynamic Orchestration)
CREATE TABLE public.system_configs (
  key VARCHAR PRIMARY KEY,
  value TEXT NOT NULL, -- Will store encrypted API Keys and Models
  updated_by UUID REFERENCES public.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projects Table
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  industry_context VARCHAR DEFAULT 'GENERAL',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PRD Versions Table (For Chat Iteration & History)
CREATE TABLE public.prd_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  version_number INT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Logs (Immutable)
CREATE TABLE public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type VARCHAR NOT NULL,
  actor_id UUID REFERENCES public.users(id),
  ip_address VARCHAR,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) Setup
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prd_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies

-- Users can read their own profile. Admins can read all.
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON public.users
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- System Configs: Only Admins can view/edit
CREATE POLICY "Admins control system configs" ON public.system_configs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Projects: Users can CRUD their own projects
CREATE POLICY "Users CRUD own projects" ON public.projects
  FOR ALL USING (auth.uid() = owner_id);

-- PRD Versions: Users can CRUD versions for their own projects
CREATE POLICY "Users CRUD own PRD versions" ON public.prd_versions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.projects WHERE id = prd_versions.project_id AND owner_id = auth.uid())
  );

-- Trigger Function to auto-create user profile from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, is_admin)
  VALUES (
    NEW.id, 
    NEW.email, 
    -- Hardcode super admin
    CASE WHEN NEW.email = 'raflian100@gmail.com' THEN TRUE ELSE FALSE END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
