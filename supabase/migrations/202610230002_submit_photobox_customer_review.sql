CREATE TABLE IF NOT EXISTS public.photobox_download_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL REFERENCES public.photobox_sessions(session_id) ON DELETE CASCADE,
  name text,
  gender text,
  birth_date date,
  email text,
  phone text,
  rating smallint CHECK (rating BETWEEN 1 AND 5),
  feedback text NOT NULL,
  voucher_code text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE (session_id)
);

ALTER TABLE public.photobox_vouchers
  ADD COLUMN IF NOT EXISTS source text;

ALTER TABLE public.photobox_payment_settings
  ADD COLUMN IF NOT EXISTS form_voucher_discount_percent bigint DEFAULT 10;

ALTER TABLE public.photobox_download_forms
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS birth_date date,
  ADD COLUMN IF NOT EXISTS rating smallint;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'photobox_download_forms_rating_check'
      AND conrelid = 'public.photobox_download_forms'::regclass
  ) THEN
    ALTER TABLE public.photobox_download_forms
      ADD CONSTRAINT photobox_download_forms_rating_check CHECK (rating BETWEEN 1 AND 5);
  END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_download_forms_session_unique
  ON public.photobox_download_forms(session_id);

ALTER TABLE public.photobox_download_forms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow anon all" ON public.photobox_download_forms;
REVOKE ALL ON TABLE public.photobox_download_forms FROM anon, authenticated;
GRANT ALL ON TABLE public.photobox_download_forms TO service_role;

CREATE OR REPLACE FUNCTION public.submit_photobox_customer_review(
  p_session_id text,
  p_name text,
  p_gender text,
  p_birth_date date,
  p_email text,
  p_phone text,
  p_rating smallint,
  p_feedback text,
  p_voucher_code text,
  p_voucher_code_sha256 text,
  p_discount_percent bigint
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_rating IS NULL OR p_rating < 1 OR p_rating > 5 THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_rating');
  END IF;

  IF p_feedback IS NULL OR length(btrim(p_feedback)) = 0 OR length(p_feedback) > 5000 THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_feedback');
  END IF;

  -- Serialize submissions for this session so two requests cannot both pass the check.
  PERFORM 1
  FROM public.photobox_sessions
  WHERE session_id = p_session_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'session_not_found');
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.photobox_download_forms WHERE session_id = p_session_id
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_submitted');
  END IF;

  INSERT INTO public.photobox_vouchers (
    code_sha256,
    code_plain,
    name,
    discount_mode,
    discount_value,
    usage_limit,
    usage_count,
    status,
    source
  ) VALUES (
    p_voucher_code_sha256,
    p_voucher_code,
    'Form: ' || p_session_id,
    'percent',
    p_discount_percent,
    1,
    0,
    'available',
    'form_feedback'
  );

  INSERT INTO public.photobox_download_forms (
    session_id,
    name,
    gender,
    birth_date,
    email,
    phone,
    rating,
    feedback,
    voucher_code
  ) VALUES (
    p_session_id,
    p_name,
    p_gender,
    p_birth_date,
    p_email,
    p_phone,
    p_rating,
    btrim(p_feedback),
    p_voucher_code
  );

  RETURN jsonb_build_object('success', true);
EXCEPTION
  WHEN unique_violation THEN
    IF EXISTS (
      SELECT 1 FROM public.photobox_download_forms WHERE session_id = p_session_id
    ) THEN
      RETURN jsonb_build_object('success', false, 'error', 'already_submitted');
    END IF;
    RETURN jsonb_build_object('success', false, 'error', 'voucher_collision');
END;
$$;

REVOKE ALL ON FUNCTION public.submit_photobox_customer_review(
  text, text, text, date, text, text, smallint, text, text, text, bigint
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.submit_photobox_customer_review(
  text, text, text, date, text, text, smallint, text, text, text, bigint
) TO service_role;
