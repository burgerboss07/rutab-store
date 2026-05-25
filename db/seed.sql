-- Seed script for Rutab Store 2.0 Streetwear Database
-- Active Project ID: sxmvfoepgrezfdjwyliy

-- 1. Cascade delete legacy data
DELETE FROM public.order_items;
DELETE FROM public.orders;
DELETE FROM public.products;
DELETE FROM public.categories;

-- 2. Insert new streetwear categories
INSERT INTO public.categories (id, name) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Hoodies'),
('550e8400-e29b-41d4-a716-446655440002', 'T-Shirts'),
('550e8400-e29b-41d4-a716-446655440003', 'Caps'),
('550e8400-e29b-41d4-a716-446655440004', 'Trousers');

-- 3. Insert premium streetwear products
INSERT INTO public.products (id, name, description, price, image_url, category, category_id, stock, is_featured, sku, subcategory) VALUES
-- Hoodies
('550e8400-e29b-41d4-a716-446655440101', 'Cyberpunk Heavyweight Hoodie', 'Oversized silhouette cut from 450GSM organic loopback cotton. Features rubberized cybernetic lettering on chest, double-lined hood, and high-tensile ribbing.', 28.000, 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1200', 'Hoodies', '550e8400-e29b-41d4-a716-446655440001', 45, true, 'RTB-HD-001', 'Oversized'),
('550e8400-e29b-41d4-a716-446655440102', 'Neo-Noir Acid Wash Hoodie', 'Heavy vintage-washed black hoodie. Standard drop shoulders, distressed hem details, and signature red contrast stitching inside.', 32.000, 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=1200', 'Hoodies', '550e8400-e29b-41d4-a716-446655440001', 30, true, 'RTB-HD-002', 'Wash'),
('550e8400-e29b-41d4-a716-446655440103', 'Reflective Cyber-Luxe Hoodie', 'Black hoodie featuring futuristic reflective striping on sleeves, customized technical hardware toggle on drawstrings, and water-repellent finish.', 35.000, 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=1200', 'Hoodies', '550e8400-e29b-41d4-a716-446655440001', 25, false, 'RTB-HD-003', 'Technical'),

-- T-Shirts
('550e8400-e29b-41d4-a716-446655440104', 'Ghost-Shell Oversized Tee', 'Ultra-heavyweight 300GSM combed cotton tee. Wide boxy fit, dropped shoulder, with a matte black minimalist silicone branding print on the back.', 16.000, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200', 'T-Shirts', '550e8400-e29b-41d4-a716-446655440002', 80, true, 'RTB-TS-001', 'Graphic'),
('550e8400-e29b-41d4-a716-446655440105', 'Rutab Signature Red Tee', 'High-contrast pure black tee with luxury red Arabic typography on chest reading "رطب". 260GSM premium fabric.', 15.000, 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1200', 'T-Shirts', '550e8400-e29b-41d4-a716-446655440002', 60, true, 'RTB-TS-002', 'Typography'),
('550e8400-e29b-41d4-a716-446655440106', 'Sub-Zero Distressed Tee', 'Vintage gray washed boxy tee with raw edge cuffs and high-collar ribbing. Features printed cyberpunk aesthetic artwork.', 18.000, 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=1200', 'T-Shirts', '550e8400-e29b-41d4-a716-446655440002', 40, false, 'RTB-TS-003', 'Vintage'),

-- Trousers
('550e8400-e29b-41d4-a716-446655440107', 'Technical Cargo Trousers', 'Waterproof techwear cargo pants with matte-black buckle straps, modular utility pockets, adjustable drawcords at ankle cuffs.', 28.000, 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=1200', 'Trousers', '550e8400-e29b-41d4-a716-446655440004', 35, true, 'RTB-TR-001', 'Techwear'),
('550e8400-e29b-41d4-a716-446655440108', 'Minimalist Black Sweatpants', 'Premium heavy cotton fleece sweatpants. Elasticated waistband, internal draws, raw seam side details, embroidered subtle tonal branding.', 22.000, 'https://images.unsplash.com/photo-1506629905607-d9d6b0b15f1c?q=80&w=1200', 'Trousers', '550e8400-e29b-41d4-a716-446655440004', 50, false, 'RTB-TR-002', 'Loungewear'),

-- Caps
('550e8400-e29b-41d4-a716-446655440109', 'Cyber-Luxe Strapback Cap', 'Unstructured low-profile 6-panel cap in heavy washed canvas. Magnetic Fidlock buckle strapback, contrast red eyelets.', 10.000, 'https://images.unsplash.com/photo-1521369909029-2afed882baee?q=80&w=1200', 'Caps', '550e8400-e29b-41d4-a716-446655440003', 100, true, 'RTB-CP-001', 'Hats'),
('550e8400-e29b-41d4-a716-446655440110', 'Rutab Tech Beanie', 'Double-layered thermal rib-knit beanie in pure black. Reversible design with embroidered red branding on front.', 8.000, 'https://images.unsplash.com/photo-1576871337622-98d48d4aa53e?q=80&w=1200', 'Caps', '550e8400-e29b-41d4-a716-446655440003', 75, false, 'RTB-CP-002', 'Hats');
