-- Shared fixed-window counters for login, public-form, and admin API limits.
-- Project: MotionGrid (SITE_SUPABASE_*).

CREATE TABLE IF NOT EXISTS public.rate_limit_counters (
    identifier      TEXT PRIMARY KEY,
    request_count   INTEGER NOT NULL,
    window_started  TIMESTAMPTZ NOT NULL,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.rate_limit_counters ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.check_rate_limit(
    p_identifier TEXT,
    p_max_requests INTEGER,
    p_window_ms INTEGER
)
RETURNS TABLE (allowed BOOLEAN, remaining INTEGER, reset_ms INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    ts TIMESTAMPTZ := clock_timestamp();
    counter public.rate_limit_counters%ROWTYPE;
BEGIN
    IF p_max_requests <= 0 OR p_window_ms <= 0 THEN
        RAISE EXCEPTION 'Rate-limit values must be positive';
    END IF;

    INSERT INTO public.rate_limit_counters AS counters (
        identifier,
        request_count,
        window_started,
        updated_at
    )
    VALUES (p_identifier, 1, ts, ts)
    ON CONFLICT (identifier) DO UPDATE SET
        request_count = CASE
            WHEN counters.window_started + make_interval(secs => p_window_ms / 1000.0) <= ts
                THEN 1
            ELSE counters.request_count + 1
        END,
        window_started = CASE
            WHEN counters.window_started + make_interval(secs => p_window_ms / 1000.0) <= ts
                THEN ts
            ELSE counters.window_started
        END,
        updated_at = ts
    RETURNING * INTO counter;

    RETURN QUERY SELECT
        counter.request_count <= p_max_requests,
        GREATEST(p_max_requests - counter.request_count, 0),
        GREATEST(
            CEIL(EXTRACT(EPOCH FROM (
                counter.window_started
                + make_interval(secs => p_window_ms / 1000.0)
                - ts
            )) * 1000)::INTEGER,
            0
        );
END;
$$;

REVOKE ALL ON FUNCTION public.check_rate_limit(TEXT, INTEGER, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INTEGER, INTEGER) TO service_role;
