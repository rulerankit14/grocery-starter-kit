ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS login_code text;

CREATE OR REPLACE FUNCTION public.gen_login_code()
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  chars text := 'abcdefghijkmnpqrstuvwxyz23456789';
  candidate text;
  i int;
BEGIN
  LOOP
    candidate := '';
    FOR i IN 1..5 LOOP
      candidate := candidate || substr(chars, 1 + floor(random() * length(chars))::int, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.user_roles WHERE login_code = candidate);
  END LOOP;
  RETURN candidate;
END;
$$;

UPDATE public.user_roles SET login_code = public.gen_login_code() WHERE login_code IS NULL;

ALTER TABLE public.user_roles ALTER COLUMN login_code SET DEFAULT public.gen_login_code();
ALTER TABLE public.user_roles ALTER COLUMN login_code SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS user_roles_login_code_key ON public.user_roles (login_code);

CREATE OR REPLACE FUNCTION public.login_code_valid(_code text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE login_code = lower(_code));
$$;

GRANT EXECUTE ON FUNCTION public.login_code_valid(text) TO anon, authenticated;