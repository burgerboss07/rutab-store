ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS customer_sizes jsonb DEFAULT '{}'::jsonb;
