CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_email TEXT;
  first_user_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  IF EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = auth.uid()) THEN
    RETURN TRUE;
  END IF;

  IF EXISTS (SELECT 1 FROM public.admin_users) THEN
    RETURN FALSE;
  END IF;

  SELECT id INTO first_user_id
  FROM auth.users
  ORDER BY created_at ASC
  LIMIT 1;

  IF first_user_id IS DISTINCT FROM auth.uid() THEN
    RETURN FALSE;
  END IF;

  SELECT email INTO current_email FROM auth.users WHERE id = auth.uid();
  INSERT INTO public.admin_users (user_id, email)
  VALUES (auth.uid(), COALESCE(current_email, ''))
  ON CONFLICT (user_id) DO NOTHING;
  RETURN TRUE;
END;
$$;
