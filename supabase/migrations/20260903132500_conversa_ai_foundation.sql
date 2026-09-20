-- ConversaAI foundation schema for Cursor-connected Supabase project.
-- Applied remotely as conversa_ai_foundation_reapply.

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE UNIQUE,
  company_name TEXT NOT NULL,
  industry TEXT,
  description TEXT,
  business_email TEXT,
  phone TEXT,
  website TEXT,
  country TEXT,
  timezone TEXT,
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#2563EB',
  secondary_color TEXT NOT NULL DEFAULT '#06B6D4',
  mission TEXT,
  business_hours TEXT,
  address TEXT,
  social_facebook TEXT,
  social_instagram TEXT,
  social_twitter TEXT,
  social_linkedin TEXT,
  social_tiktok TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.kb_general (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'ready',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.kb_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  caption TEXT,
  storage_path TEXT NOT NULL,
  image_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ready',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.kb_faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.kb_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(12,2),
  currency TEXT NOT NULL DEFAULT 'USD',
  availability TEXT NOT NULL DEFAULT 'in_stock',
  category TEXT,
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.kb_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  price NUMERIC(12,2),
  currency TEXT NOT NULL DEFAULT 'USD',
  availability TEXT NOT NULL DEFAULT 'available',
  category TEXT,
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.kb_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  property_type TEXT,
  location TEXT,
  price NUMERIC(14,2),
  currency TEXT NOT NULL DEFAULT 'USD',
  bedrooms INTEGER,
  bathrooms INTEGER,
  area TEXT,
  description TEXT,
  features TEXT[] NOT NULL DEFAULT '{}',
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'available',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'agent',
  status TEXT NOT NULL DEFAULT 'invited',
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (owner_id, email)
);

CREATE TABLE IF NOT EXISTS public.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_type TEXT NOT NULL,
  display_name TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'disconnected',
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (owner_id, channel_type)
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_email TEXT,
  action TEXT NOT NULL,
  area TEXT NOT NULL DEFAULT 'general',
  summary TEXT NOT NULL DEFAULT '',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.businesses TO authenticated;
GRANT ALL ON public.businesses TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kb_general TO authenticated;
GRANT ALL ON public.kb_general TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kb_images TO authenticated;
GRANT ALL ON public.kb_images TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kb_faqs TO authenticated;
GRANT ALL ON public.kb_faqs TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kb_products TO authenticated;
GRANT ALL ON public.kb_products TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kb_services TO authenticated;
GRANT ALL ON public.kb_services TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kb_properties TO authenticated;
GRANT ALL ON public.kb_properties TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.org_members TO authenticated;
GRANT ALL ON public.org_members TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.channels TO authenticated;
GRANT ALL ON public.channels TO service_role;
GRANT SELECT, INSERT, DELETE ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_general ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kb_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Owners manage own business" ON public.businesses;
CREATE POLICY "Owners manage own business" ON public.businesses FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners manage their general knowledge" ON public.kb_general;
CREATE POLICY "Owners manage their general knowledge" ON public.kb_general FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners manage their knowledge images" ON public.kb_images;
CREATE POLICY "Owners manage their knowledge images" ON public.kb_images FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners manage their faqs" ON public.kb_faqs;
CREATE POLICY "Owners manage their faqs" ON public.kb_faqs FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners manage their products" ON public.kb_products;
CREATE POLICY "Owners manage their products" ON public.kb_products FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners manage their services" ON public.kb_services;
CREATE POLICY "Owners manage their services" ON public.kb_services FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners manage their properties" ON public.kb_properties;
CREATE POLICY "Owners manage their properties" ON public.kb_properties FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners manage their members" ON public.org_members;
CREATE POLICY "Owners manage their members" ON public.org_members FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners manage their channels" ON public.channels;
CREATE POLICY "Owners manage their channels" ON public.channels FOR ALL TO authenticated USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "Owners read their audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Owners write their audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Owners delete their audit logs" ON public.audit_logs;
CREATE POLICY "Owners read their audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (auth.uid() = owner_id);
CREATE POLICY "Owners write their audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Owners delete their audit logs" ON public.audit_logs FOR DELETE TO authenticated USING (auth.uid() = owner_id);

CREATE INDEX IF NOT EXISTS idx_kb_general_owner ON public.kb_general(owner_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_kb_images_owner ON public.kb_images(owner_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_kb_faqs_owner ON public.kb_faqs(owner_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_kb_products_owner ON public.kb_products(owner_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_kb_services_owner ON public.kb_services(owner_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_kb_properties_owner ON public.kb_properties(owner_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_owner_created_idx ON public.audit_logs (owner_id, created_at DESC);

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_businesses_updated_at ON public.businesses;
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_kb_general_updated_at ON public.kb_general;
CREATE TRIGGER update_kb_general_updated_at BEFORE UPDATE ON public.kb_general FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_kb_images_updated_at ON public.kb_images;
CREATE TRIGGER update_kb_images_updated_at BEFORE UPDATE ON public.kb_images FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_kb_faqs_updated_at ON public.kb_faqs;
CREATE TRIGGER update_kb_faqs_updated_at BEFORE UPDATE ON public.kb_faqs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_kb_products_updated_at ON public.kb_products;
CREATE TRIGGER update_kb_products_updated_at BEFORE UPDATE ON public.kb_products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_kb_services_updated_at ON public.kb_services;
CREATE TRIGGER update_kb_services_updated_at BEFORE UPDATE ON public.kb_services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_kb_properties_updated_at ON public.kb_properties;
CREATE TRIGGER update_kb_properties_updated_at BEFORE UPDATE ON public.kb_properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_org_members_updated_at ON public.org_members;
CREATE TRIGGER update_org_members_updated_at BEFORE UPDATE ON public.org_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_channels_updated_at ON public.channels;
CREATE TRIGGER update_channels_updated_at BEFORE UPDATE ON public.channels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('business-logos', 'business-logos', false, 5242880)
ON CONFLICT (id) DO UPDATE SET public = false, file_size_limit = 5242880;

DROP POLICY IF EXISTS "Users read own business logo" ON storage.objects;
DROP POLICY IF EXISTS "Users upload own business logo" ON storage.objects;
DROP POLICY IF EXISTS "Users update own business logo" ON storage.objects;
DROP POLICY IF EXISTS "Users delete own business logo" ON storage.objects;

CREATE POLICY "Users read own business logo" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'business-logos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users upload own business logo" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'business-logos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users update own business logo" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'business-logos' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'business-logos' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users delete own business logo" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'business-logos' AND (storage.foldername(name))[1] = auth.uid()::text);
