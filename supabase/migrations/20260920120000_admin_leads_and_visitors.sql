CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.website_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company_name TEXT,
  business_type TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  source TEXT NOT NULL DEFAULT 'contact_form',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.visitor_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  path TEXT NOT NULL DEFAULT '/',
  referrer TEXT,
  user_agent TEXT,
  device_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.admin_users TO authenticated;
GRANT INSERT ON public.website_leads TO anon, authenticated;
GRANT SELECT, UPDATE ON public.website_leads TO authenticated;
GRANT INSERT ON public.visitor_events TO anon, authenticated;
GRANT SELECT ON public.visitor_events TO authenticated;

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view their admin record"
  ON public.admin_users FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can submit a website lead"
  ON public.website_leads FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view website leads"
  ON public.website_leads FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Admins can update website leads"
  ON public.website_leads FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE POLICY "Anyone can record a visitor event"
  ON public.visitor_events FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view visitor events"
  ON public.visitor_events FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()));

CREATE INDEX IF NOT EXISTS website_leads_created_at_idx ON public.website_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS visitor_events_created_at_idx ON public.visitor_events (created_at DESC);
CREATE INDEX IF NOT EXISTS visitor_events_session_id_idx ON public.visitor_events (session_id);

CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_email TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  IF EXISTS (SELECT 1 FROM public.admin_users) THEN
    RETURN EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid());
  END IF;

  SELECT email INTO current_email FROM auth.users WHERE id = auth.uid();
  INSERT INTO public.admin_users (user_id, email)
  VALUES (auth.uid(), COALESCE(current_email, ''))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN TRUE;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_first_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;
