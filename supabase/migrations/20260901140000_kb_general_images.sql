-- General knowledge entries (title + content)
CREATE TABLE public.kb_general (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'ready',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kb_general TO authenticated;
GRANT ALL ON public.kb_general TO service_role;
ALTER TABLE public.kb_general ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage their general knowledge" ON public.kb_general FOR ALL TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- Standalone knowledge images
CREATE TABLE public.kb_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT '',
  caption text,
  storage_path text NOT NULL,
  image_url text NOT NULL,
  status text NOT NULL DEFAULT 'ready',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kb_images TO authenticated;
GRANT ALL ON public.kb_images TO service_role;
ALTER TABLE public.kb_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage their knowledge images" ON public.kb_images FOR ALL TO authenticated
  USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

-- Service images + category
ALTER TABLE public.kb_services
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS image_urls text[] NOT NULL DEFAULT '{}';

CREATE INDEX idx_kb_general_owner ON public.kb_general(owner_id, updated_at DESC);
CREATE INDEX idx_kb_images_owner ON public.kb_images(owner_id, updated_at DESC);

CREATE TRIGGER update_kb_general_updated_at BEFORE UPDATE ON public.kb_general
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_kb_images_updated_at BEFORE UPDATE ON public.kb_images
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
