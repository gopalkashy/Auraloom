-- ============================================================
-- AuraLoom E-Commerce — Complete Database Migration
-- ============================================================
-- Run this ENTIRE script in your new Supabase SQL Editor
-- (One-shot setup: tables → RLS → functions → triggers → policies → storage → seed data)
-- ============================================================

-- 1. PROFILES (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. SUBCATEGORIES
CREATE TABLE IF NOT EXISTS subcategories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

-- 4. PRODUCTS
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subcategory_id UUID NOT NULL REFERENCES subcategories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2),
  discount_percentage INTEGER DEFAULT 0,
  stock_qty INTEGER DEFAULT 0,
  sku TEXT,
  images TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CART ITEMS
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- 6. ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  order_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','confirmed','processing','shipped','out_for_delivery','delivered','cancelled','returned')),
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending','paid','failed','refunded')),
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) DEFAULT 0,
  shipping_cost DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  shipping_name TEXT,
  shipping_phone TEXT,
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_pincode TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ORDER ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_image TEXT,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PASSWORD RESET TOKENS (for self-managed password reset)
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcategories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Admin check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = auth.uid()),
    false
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists, then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- Profiles
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;

CREATE POLICY "profiles_select_own" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id OR is_admin());
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON profiles FOR DELETE TO authenticated USING (auth.uid() = id);

-- Categories
DROP POLICY IF EXISTS "categories_select_all" ON categories;
DROP POLICY IF EXISTS "categories_insert_admin" ON categories;
DROP POLICY IF EXISTS "categories_update_admin" ON categories;
DROP POLICY IF EXISTS "categories_delete_admin" ON categories;

CREATE POLICY "categories_select_all" ON categories FOR SELECT USING (true);
CREATE POLICY "categories_insert_admin" ON categories FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "categories_update_admin" ON categories FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "categories_delete_admin" ON categories FOR DELETE TO authenticated USING (is_admin());

-- Subcategories
DROP POLICY IF EXISTS "subcategories_select_all" ON subcategories;
DROP POLICY IF EXISTS "subcategories_insert_admin" ON subcategories;
DROP POLICY IF EXISTS "subcategories_update_admin" ON subcategories;
DROP POLICY IF EXISTS "subcategories_delete_admin" ON subcategories;

CREATE POLICY "subcategories_select_all" ON subcategories FOR SELECT USING (true);
CREATE POLICY "subcategories_insert_admin" ON subcategories FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "subcategories_update_admin" ON subcategories FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "subcategories_delete_admin" ON subcategories FOR DELETE TO authenticated USING (is_admin());

-- Products
DROP POLICY IF EXISTS "products_select_all" ON products;
DROP POLICY IF EXISTS "products_insert_admin" ON products;
DROP POLICY IF EXISTS "products_update_admin" ON products;
DROP POLICY IF EXISTS "products_delete_admin" ON products;

CREATE POLICY "products_select_all" ON products FOR SELECT USING (true);
CREATE POLICY "products_insert_admin" ON products FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "products_update_admin" ON products FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "products_delete_admin" ON products FOR DELETE TO authenticated USING (is_admin());

-- Cart Items
DROP POLICY IF EXISTS "cart_select_own" ON cart_items;
DROP POLICY IF EXISTS "cart_insert_own" ON cart_items;
DROP POLICY IF EXISTS "cart_update_own" ON cart_items;
DROP POLICY IF EXISTS "cart_delete_own" ON cart_items;

CREATE POLICY "cart_select_own" ON cart_items FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "cart_insert_own" ON cart_items FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cart_update_own" ON cart_items FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cart_delete_own" ON cart_items FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Orders
DROP POLICY IF EXISTS "orders_select_own" ON orders;
DROP POLICY IF EXISTS "orders_insert_own" ON orders;
DROP POLICY IF EXISTS "orders_update_admin" ON orders;
DROP POLICY IF EXISTS "orders_delete_admin" ON orders;

CREATE POLICY "orders_select_own" ON orders FOR SELECT TO authenticated USING (auth.uid() = user_id OR is_admin());
CREATE POLICY "orders_insert_own" ON orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders_update_admin" ON orders FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "orders_delete_admin" ON orders FOR DELETE TO authenticated USING (is_admin());

-- Order items
DROP POLICY IF EXISTS "order_items_select_own" ON order_items;
DROP POLICY IF EXISTS "order_items_insert_own" ON order_items;
DROP POLICY IF EXISTS "order_items_update_admin" ON order_items;
DROP POLICY IF EXISTS "order_items_delete_admin" ON order_items;

CREATE POLICY "order_items_select_own" ON order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND (orders.user_id = auth.uid() OR is_admin())));
CREATE POLICY "order_items_insert_own" ON order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "order_items_update_admin" ON order_items FOR UPDATE TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "order_items_delete_admin" ON order_items FOR DELETE TO authenticated USING (is_admin());

-- Password reset tokens (service_role only via Netlify Functions)
DROP POLICY IF EXISTS "service_role_all" ON password_reset_tokens;
CREATE POLICY "service_role_all" ON password_reset_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- STORAGE BUCKET (Product Images)
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg','image/png','image/webp','image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "product_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "product_images_admin_upload" ON storage.objects;
DROP POLICY IF EXISTS "product_images_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "product_images_admin_delete" ON storage.objects;

CREATE POLICY "product_images_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "product_images_admin_upload" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'product-images' AND is_admin());
CREATE POLICY "product_images_admin_update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'product-images' AND is_admin());
CREATE POLICY "product_images_admin_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'product-images' AND is_admin());

-- ============================================================
-- SEED DATA (Categories & Subcategories)
-- ============================================================

INSERT INTO categories (name, slug, description, sort_order) VALUES
  ('Ladies Bags', 'ladies-bags', 'Stylish and elegant bags for every occasion', 1),
  ('Artificial Jewellery', 'artificial-jewellery', 'Beautiful handcrafted artificial jewellery', 2),
  ('Ladies Clothes', 'ladies-clothes', 'Trendy and elegant ladies fashion', 3)
ON CONFLICT (slug) DO NOTHING;

-- Subcategories for Ladies Bags
INSERT INTO subcategories (category_id, name, slug, sort_order)
SELECT id, 'Handbags', 'handbags', 1 FROM categories WHERE slug = 'ladies-bags'
AND NOT EXISTS (SELECT 1 FROM subcategories WHERE slug = 'handbags' AND category_id = (SELECT id FROM categories WHERE slug = 'ladies-bags'));
INSERT INTO subcategories (category_id, name, slug, sort_order)
SELECT id, 'Clutches', 'clutches', 2 FROM categories WHERE slug = 'ladies-bags'
AND NOT EXISTS (SELECT 1 FROM subcategories WHERE slug = 'clutches' AND category_id = (SELECT id FROM categories WHERE slug = 'ladies-bags'));
INSERT INTO subcategories (category_id, name, slug, sort_order)
SELECT id, 'Tote Bags', 'tote-bags', 3 FROM categories WHERE slug = 'ladies-bags'
AND NOT EXISTS (SELECT 1 FROM subcategories WHERE slug = 'tote-bags' AND category_id = (SELECT id FROM categories WHERE slug = 'ladies-bags'));
INSERT INTO subcategories (category_id, name, slug, sort_order)
SELECT id, 'Sling Bags', 'sling-bags', 4 FROM categories WHERE slug = 'ladies-bags'
AND NOT EXISTS (SELECT 1 FROM subcategories WHERE slug = 'sling-bags' AND category_id = (SELECT id FROM categories WHERE slug = 'ladies-bags'));

-- Subcategories for Artificial Jewellery
INSERT INTO subcategories (category_id, name, slug, sort_order)
SELECT id, 'Necklaces', 'necklaces', 1 FROM categories WHERE slug = 'artificial-jewellery'
AND NOT EXISTS (SELECT 1 FROM subcategories WHERE slug = 'necklaces' AND category_id = (SELECT id FROM categories WHERE slug = 'artificial-jewellery'));
INSERT INTO subcategories (category_id, name, slug, sort_order)
SELECT id, 'Earrings', 'earrings', 2 FROM categories WHERE slug = 'artificial-jewellery'
AND NOT EXISTS (SELECT 1 FROM subcategories WHERE slug = 'earrings' AND category_id = (SELECT id FROM categories WHERE slug = 'artificial-jewellery'));
INSERT INTO subcategories (category_id, name, slug, sort_order)
SELECT id, 'Bangles & Bracelets', 'bangles-bracelets', 3 FROM categories WHERE slug = 'artificial-jewellery'
AND NOT EXISTS (SELECT 1 FROM subcategories WHERE slug = 'bangles-bracelets' AND category_id = (SELECT id FROM categories WHERE slug = 'artificial-jewellery'));
INSERT INTO subcategories (category_id, name, slug, sort_order)
SELECT id, 'Rings', 'rings', 4 FROM categories WHERE slug = 'artificial-jewellery'
AND NOT EXISTS (SELECT 1 FROM subcategories WHERE slug = 'rings' AND category_id = (SELECT id FROM categories WHERE slug = 'artificial-jewellery'));

-- Subcategories for Ladies Clothes
INSERT INTO subcategories (category_id, name, slug, sort_order)
SELECT id, 'Kurtis', 'kurtis', 1 FROM categories WHERE slug = 'ladies-clothes'
AND NOT EXISTS (SELECT 1 FROM subcategories WHERE slug = 'kurtis' AND category_id = (SELECT id FROM categories WHERE slug = 'ladies-clothes'));
INSERT INTO subcategories (category_id, name, slug, sort_order)
SELECT id, 'Sarees', 'sarees', 2 FROM categories WHERE slug = 'ladies-clothes'
AND NOT EXISTS (SELECT 1 FROM subcategories WHERE slug = 'sarees' AND category_id = (SELECT id FROM categories WHERE slug = 'ladies-clothes'));
INSERT INTO subcategories (category_id, name, slug, sort_order)
SELECT id, 'Suits & Salwars', 'suits-salwars', 3 FROM categories WHERE slug = 'ladies-clothes'
AND NOT EXISTS (SELECT 1 FROM subcategories WHERE slug = 'suits-salwars' AND category_id = (SELECT id FROM categories WHERE slug = 'ladies-clothes'));
INSERT INTO subcategories (category_id, name, slug, sort_order)
SELECT id, 'Western Wear', 'western-wear', 4 FROM categories WHERE slug = 'ladies-clothes'
AND NOT EXISTS (SELECT 1 FROM subcategories WHERE slug = 'western-wear' AND category_id = (SELECT id FROM categories WHERE slug = 'ladies-clothes'));

-- ============================================================
-- MAKE FIRST USER AN ADMIN (run AFTER you sign up)
-- Replace 'your-email@example.com' with YOUR email
-- ============================================================
-- Uncomment and run this AFTER you create your account:
-- UPDATE profiles SET is_admin = true
-- WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com' LIMIT 1);
