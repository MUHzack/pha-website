-- Store the customer's answer to the social media photo upload question.
ALTER TABLE public.photobox_download_forms
  ADD COLUMN IF NOT EXISTS social_media_consent boolean NOT NULL DEFAULT false;

-- Replace the existing review RPC with a version that receives the consent answer.
DROP FUNCTION IF EXISTS public.submit_photobox_customer_review(
  text, text, text, date, text, text, text, text, smallint, text, text, text, bigint
);

CREATE FUNCTION public.submit_photobox_customer_review(
  p_session_id text,
  p_name text,
  p_gender text,
  p_birth_date date,
  p_email text,
  p_phone text,
  p_visited_branch text,
  p_discovery_source text,
  p_rating smallint,
  p_feedback text,
  p_voucher_code text,
  p_voucher_code_sha256 text,
  p_discount_percent bigint,
  p_social_media_consent boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_expires_at timestamptz := now() + interval '14 days';
BEGIN
  IF p_rating IS NULL OR p_rating < 1 OR p_rating > 5 THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_rating');
  END IF;

  IF p_feedback IS NULL OR length(btrim(p_feedback)) < 10 OR length(p_feedback) > 5000 THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_feedback');
  END IF;

  IF p_name IS NULL OR length(btrim(p_name)) = 0
    OR p_gender IS NULL OR p_gender NOT IN ('female', 'male')
    OR p_birth_date IS NULL OR p_birth_date > (current_date - interval '10 years')::date
    OR p_phone IS NULL OR btrim(p_phone) !~ '^(\+?62|0)[0-9 .()-]{8,15}$'
    OR p_visited_branch IS NULL OR length(btrim(p_visited_branch)) = 0
    OR p_discovery_source IS NULL OR p_discovery_source NOT IN ('instagram', 'tiktok', 'friends_family', 'google', 'other')
    OR p_social_media_consent IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_customer_details');
  END IF;

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
    code_sha256, code_plain, name, discount_mode, discount_value,
    usage_limit, usage_count, status, source, expires_at
  ) VALUES (
    p_voucher_code_sha256, p_voucher_code, 'Form: ' || p_session_id,
    'percent', p_discount_percent, 1, 0, 'available', 'form_feedback', v_expires_at
  );

  INSERT INTO public.photobox_download_forms (
    session_id, name, gender, birth_date, email, phone, visited_branch,
    discovery_source, rating, feedback, voucher_code, social_media_consent
  ) VALUES (
    p_session_id, btrim(p_name), p_gender, p_birth_date,
    NULLIF(btrim(p_email), ''), btrim(p_phone), btrim(p_visited_branch),
    p_discovery_source, p_rating, btrim(p_feedback), p_voucher_code,
    p_social_media_consent
  );

  RETURN jsonb_build_object('success', true, 'expiresAt', v_expires_at);
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
  text, text, text, date, text, text, text, text, smallint, text, text, text, bigint, boolean
) FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.submit_photobox_customer_review(
  text, text, text, date, text, text, text, text, smallint, text, text, text, bigint, boolean
) TO service_role;
