-- ============================================================
-- Rutab Store 2.0 — Full Database Schema Migration v2
-- Run in Supabase SQL Editor
-- ============================================================

-- 0. Add user_id and phone to existing orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS phone text;

-- 1. PROFILES (enhance existing)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'customer' NOT NULL,
  ADD COLUMN IF NOT EXISTS is_2fa_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS loyalty_points integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS area text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- 2. USER ADDRESSES
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  address_line1 text NOT NULL,
  address_line2 text,
  city text,
  area text,
  is_default boolean DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own addresses" ON public.addresses
  FOR ALL USING (auth.uid() = user_id);

-- 3. WISHLIST ITEMS (persistent)
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id, product_id)
);
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own wishlist" ON public.wishlist_items
  FOR ALL USING (auth.uid() = user_id);

-- 4. COUPONS / DISCOUNT CODES
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_shipping')),
  discount_value numeric(10,3) NOT NULL,
  min_order_amount numeric(10,3) DEFAULT 0,
  usage_limit integer DEFAULT 0,
  used_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage coupons" ON public.coupons FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'manager')));
CREATE POLICY "Anyone can read active coupons" ON public.coupons FOR SELECT
  USING (is_active = true);

-- 5. BANNERS (Homepage CMS)
CREATE TABLE IF NOT EXISTS public.banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  image_url text NOT NULL,
  mobile_image_url text,
  cta_text text,
  cta_link text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage banners" ON public.banners FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'manager')));
CREATE POLICY "Anyone can view active banners" ON public.banners FOR SELECT
  USING (is_active = true);

-- 6. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users,
  action text NOT NULL,
  target_type text,
  target_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  ip_address text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view audit logs" ON public.audit_logs FOR SELECT
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'manager')));

-- 7. PRODUCT VARIANTS (proper variant support)
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products ON DELETE CASCADE NOT NULL,
  sku text,
  size text,
  color text,
  price numeric(10,3),
  stock integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage variants" ON public.product_variants FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'manager')));
CREATE POLICY "Anyone can view variants" ON public.product_variants FOR SELECT
  USING (true);

-- 8. REVIEWS / RATINGS
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  is_approved boolean DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(product_id, user_id)
);
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can create own reviews" ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Everyone can view approved reviews" ON public.reviews FOR SELECT
  USING (is_approved = true OR auth.uid() = user_id);

-- 9. EMAIL NOTIFICATIONS LOG
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email text NOT NULL,
  subject text NOT NULL,
  template text,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. RBAC ROLES (reference table)
CREATE TABLE IF NOT EXISTS public.roles (
  name text PRIMARY KEY,
  description text,
  permissions jsonb DEFAULT '[]'::jsonb
);
INSERT INTO public.roles (name, description, permissions) VALUES
  ('super_admin', 'Full system access', '["*"]'::jsonb),
  ('manager', 'Products, orders, customers', '["products:*", "orders:*", "customers:*", "analytics:read"]'::jsonb),
  ('support', 'Orders and customers (view only)', '["orders:read", "customers:read"]'::jsonb),
  ('customer', 'Storefront user', '["account:*"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_user_id ON public.wishlist_items(user_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
