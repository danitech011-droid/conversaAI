-- Company information extras on businesses
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS mission text,
  ADD COLUMN IF NOT EXISTS business_hours text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS social_facebook text,
  ADD COLUMN IF NOT EXISTS social_instagram text,
  ADD COLUMN IF NOT EXISTS social_twitter text,
  ADD COLUMN IF NOT EXISTS social_linkedin text,
  ADD COLUMN IF NOT EXISTS social_tiktok text;

-- FAQs
CREATE TABLE public.kb_faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question text NOT NULL,
  answer text NOT NULL,
  category text,
  status text NOT NULL DEFAULT 'published',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kb_faqs TO authenticated;
GRANT ALL ON public.kb_faqs TO service_role;
ALTER TABLE public.kb_faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage their faqs" ON public.kb_faqs FOR ALL TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- Products
CREATE TABLE public.kb_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price numeric(12,2),
  currency text NOT NULL DEFAULT 'USD',
  availability text NOT NULL DEFAULT 'in_stock',
  category text,
  image_urls text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kb_products TO authenticated;
GRANT ALL ON public.kb_products TO service_role;
ALTER TABLE public.kb_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage their products" ON public.kb_products FOR ALL TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- Services
CREATE TABLE public.kb_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  duration text,
  price numeric(12,2),
  currency text NOT NULL DEFAULT 'USD',
  availability text NOT NULL DEFAULT 'available',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kb_services TO authenticated;
GRANT ALL ON public.kb_services TO service_role;
ALTER TABLE public.kb_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage their services" ON public.kb_services FOR ALL TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- Properties
CREATE TABLE public.kb_properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  property_type text,
  location text,
  price numeric(14,2),
  currency text NOT NULL DEFAULT 'USD',
  bedrooms integer,
  bathrooms integer,
  area text,
  description text,
  features text[] NOT NULL DEFAULT '{}',
  image_urls text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'available',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kb_properties TO authenticated;
GRANT ALL ON public.kb_properties TO service_role;
ALTER TABLE public.kb_properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage their properties" ON public.kb_properties FOR ALL TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE INDEX idx_kb_faqs_owner ON public.kb_faqs(owner_id, updated_at DESC);
CREATE INDEX idx_kb_products_owner ON public.kb_products(owner_id, updated_at DESC);
CREATE INDEX idx_kb_services_owner ON public.kb_services(owner_id, updated_at DESC);
CREATE INDEX idx_kb_properties_owner ON public.kb_properties(owner_id, updated_at DESC);

CREATE TRIGGER update_kb_faqs_updated_at BEFORE UPDATE ON public.kb_faqs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_kb_products_updated_at BEFORE UPDATE ON public.kb_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_kb_services_updated_at BEFORE UPDATE ON public.kb_services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_kb_properties_updated_at BEFORE UPDATE ON public.kb_properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();