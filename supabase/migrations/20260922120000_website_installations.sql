-- Public website installation records. The public identifier is intentionally
-- separate from the internal row id and is the only identifier used by embeds.
CREATE TABLE IF NOT EXISTS public.website_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID,
  public_installation_id TEXT NOT NULL UNIQUE DEFAULT ('wi_' || encode(gen_random_bytes(18), 'hex')),
  website_url TEXT NOT NULL,
  domain TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'disabled', 'verification_pending')),
  is_active BOOLEAN NOT NULL DEFAULT false,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT website_installations_url_check CHECK (website_url ~* '^https?://'),
  CONSTRAINT website_installations_domain_check CHECK (length(domain) > 0)
);

CREATE INDEX IF NOT EXISTS website_installations_owner_idx
  ON public.website_installations (owner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS website_installations_public_id_idx
  ON public.website_installations (public_installation_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.website_installations TO authenticated;

ALTER TABLE public.website_installations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Owners manage their website installations" ON public.website_installations;
CREATE POLICY "Owners manage their website installations"
  ON public.website_installations FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP TRIGGER IF EXISTS update_website_installations_updated_at ON public.website_installations;
CREATE TRIGGER update_website_installations_updated_at
  BEFORE UPDATE ON public.website_installations FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.get_widget_config(p_installation_id TEXT)
RETURNS TABLE (
  public_installation_id TEXT,
  agent_name TEXT,
  welcome_message TEXT,
  logo_url TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  status TEXT,
  is_active BOOLEAN
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    wi.public_installation_id,
    COALESCE(u.raw_user_meta_data->'conversa_onboarding'->>'assistantName', b.company_name, 'ConversaAI Assistant'),
    COALESCE(u.raw_user_meta_data->'conversa_onboarding'->>'welcomeMessage', 'Hi! How can we help?'),
    CASE WHEN b.logo_url LIKE 'http%' THEN b.logo_url ELSE NULL END,
    COALESCE(b.primary_color, '#2563EB'),
    COALESCE(b.secondary_color, '#06B6D4'),
    wi.status,
    wi.is_active
  FROM public.website_installations wi
  JOIN auth.users u ON u.id = wi.owner_id
  LEFT JOIN public.businesses b ON b.owner_id = wi.owner_id
  WHERE wi.public_installation_id = p_installation_id
    AND wi.is_active = true
    AND wi.status = 'active';
$$;

REVOKE ALL ON FUNCTION public.get_widget_config(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_widget_config(TEXT) TO anon, authenticated;