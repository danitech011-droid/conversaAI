-- Conversation foundation for public website visitors.
-- Public IDs are scoped to an installation; internal UUIDs stay server-side.
CREATE TABLE IF NOT EXISTS public.visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  installation_id UUID NOT NULL REFERENCES public.website_installations(id) ON DELETE CASCADE,
  visitor_public_id TEXT NOT NULL DEFAULT ('vi_' || encode(gen_random_bytes(18), 'hex')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (installation_id, visitor_public_id)
);

CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  installation_id UUID NOT NULL REFERENCES public.website_installations(id) ON DELETE CASCADE,
  visitor_id UUID NOT NULL REFERENCES public.visitors(id) ON DELETE CASCADE,
  agent_id UUID,
  channel TEXT NOT NULL DEFAULT 'website' CHECK (channel IN ('website', 'whatsapp', 'instagram', 'messenger', 'other')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'pending', 'human_handoff')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL CHECK (length(content) BETWEEN 1 AND 12000),
  channel TEXT NOT NULL DEFAULT 'website' CHECK (channel IN ('website', 'whatsapp', 'instagram', 'messenger', 'other')),
  sender_type TEXT NOT NULL CHECK (sender_type IN ('visitor', 'AI', 'human', 'system')),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS visitors_owner_idx
  ON public.visitors (owner_id, last_seen_at DESC);
CREATE INDEX IF NOT EXISTS visitors_installation_public_id_idx
  ON public.visitors (installation_id, visitor_public_id);
CREATE INDEX IF NOT EXISTS conversations_owner_idx
  ON public.conversations (owner_id, last_message_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS conversations_visitor_status_idx
  ON public.conversations (visitor_id, status, last_message_at DESC NULLS LAST);
CREATE UNIQUE INDEX IF NOT EXISTS conversations_one_open_per_visitor_idx
  ON public.conversations (installation_id, visitor_id)
  WHERE status = 'open';
CREATE INDEX IF NOT EXISTS messages_conversation_created_idx
  ON public.messages (conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS messages_owner_created_idx
  ON public.messages (owner_id, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.visitors TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;

ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owners manage their visitors" ON public.visitors;
CREATE POLICY "Owners manage their visitors"
  ON public.visitors FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM public.website_installations wi
      WHERE wi.id = installation_id AND wi.owner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Owners manage their conversations" ON public.conversations;
CREATE POLICY "Owners manage their conversations"
  ON public.conversations FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM public.website_installations wi
      WHERE wi.id = installation_id AND wi.owner_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.visitors v
      WHERE v.id = visitor_id AND v.owner_id = auth.uid() AND v.installation_id = installation_id
    )
  );

DROP POLICY IF EXISTS "Owners manage their messages" ON public.messages;
CREATE POLICY "Owners manage their messages"
  ON public.messages FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (
    auth.uid() = owner_id
    AND EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id AND c.owner_id = auth.uid()
    )
  );

DROP TRIGGER IF EXISTS update_visitors_updated_at ON public.visitors;
CREATE TRIGGER update_visitors_updated_at
  BEFORE UPDATE ON public.visitors FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
DROP TRIGGER IF EXISTS update_conversations_updated_at ON public.conversations;
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();