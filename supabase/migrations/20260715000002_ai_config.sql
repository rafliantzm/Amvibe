-- AI Config Table
-- Mirrored from frontend/supabase/migrations/ai_config.sql so Supabase CLI can apply it.

CREATE TABLE IF NOT EXISTS public.ai_config (
  id          uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key     text        NOT NULL,
  model_id    text        NOT NULL DEFAULT 'gemini-3.1-flash-lite',
  is_active   boolean     NOT NULL DEFAULT true,
  updated_at  timestamptz NOT NULL DEFAULT now(),
  updated_by  uuid        REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Only one row can be active at a time
CREATE UNIQUE INDEX IF NOT EXISTS ai_config_single_active
  ON public.ai_config (is_active)
  WHERE is_active = true;

-- RLS - service role bypasses RLS; authenticated admins must be explicitly allowed
ALTER TABLE public.ai_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all" ON public.ai_config;
DROP POLICY IF EXISTS "anon_read" ON public.ai_config;
DROP POLICY IF EXISTS "allow_all" ON public.ai_config;
DROP POLICY IF EXISTS "admins_manage_ai_config" ON public.ai_config;

CREATE POLICY "admins_manage_ai_config" ON public.ai_config
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid()
        AND is_admin = TRUE
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE id = auth.uid()
        AND is_admin = TRUE
    )
  );

INSERT INTO public.ai_config (api_key, model_id, is_active)
VALUES ('PLACEHOLDER_UPDATE_VIA_ADMIN_PANEL', 'gemini-3.1-flash-lite', true)
ON CONFLICT DO NOTHING;
