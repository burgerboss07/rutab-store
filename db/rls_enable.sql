-- ============================================================
-- Enable Row Level Security on all public tables
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/[ref]/sql/new
-- ============================================================

-- Helper: admin role check (reusable across policies)
-- Assumes profiles.role column exists (added in migration_v2.sql)

-- 1. CATEGORIES
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read categories" ON public.categories;
CREATE POLICY "Anyone can read categories" ON public.categories
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can write categories" ON public.categories;
CREATE POLICY "Admins can write categories" ON public.categories
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'manager'))
  );

-- 2. PRODUCTS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read products" ON public.products;
CREATE POLICY "Anyone can read products" ON public.products
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can write products" ON public.products;
CREATE POLICY "Admins can write products" ON public.products
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'manager'))
  );

-- 3. ORDERS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
CREATE POLICY "Users can read own orders" ON public.orders
  FOR SELECT USING (
    auth.uid() = user_id
    OR auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'manager'))
  );
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
CREATE POLICY "Users can create orders" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders" ON public.orders
  FOR UPDATE USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'manager'))
  );

-- 4. ORDER ITEMS
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own order items" ON public.order_items;
CREATE POLICY "Users can read own order items" ON public.order_items
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM public.orders WHERE id = order_id)
    OR auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'manager'))
  );
DROP POLICY IF EXISTS "Users can create order items" ON public.order_items;
CREATE POLICY "Users can create order items" ON public.order_items
  FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT user_id FROM public.orders WHERE id = order_id)
  );

-- 5. COUPONS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read active coupons" ON public.coupons;
CREATE POLICY "Anyone can read active coupons" ON public.coupons
  FOR SELECT USING (is_active = true);
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;
CREATE POLICY "Admins can manage coupons" ON public.coupons
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'manager'))
  );

-- 6. SETTINGS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read settings" ON public.settings;
CREATE POLICY "Anyone can read settings" ON public.settings
  FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins can write settings" ON public.settings;
CREATE POLICY "Admins can write settings" ON public.settings
  FOR ALL USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role IN ('super_admin', 'manager'))
  );

-- 7. FIX PROFILES INSERT POLICY (currently allows unrestricted insert)
DROP POLICY IF EXISTS "Allow individual insert" ON public.profiles;
CREATE POLICY "Allow individual insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
