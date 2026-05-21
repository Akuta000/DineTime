-- RE-RUN THIS SQL IN SUPABASE SQL EDITOR --
-- RECOMMENDED: Go to Authentication > Providers > Email and turn OFF "Confirm email" for immediate signups.

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  role TEXT DEFAULT 'STUDENT', -- 'STUDENT' or 'VENDOR'
  student_id TEXT,
  dietary_prefs TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  budget_range TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS stalls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  category TEXT,
  is_open BOOLEAN DEFAULT true,
  rating DECIMAL(3,2) DEFAULT 0,
  total_ratings INTEGER DEFAULT 0,
  owner_id UUID REFERENCES auth.users ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  stall_id UUID REFERENCES stalls ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  category TEXT,
  is_available BOOLEAN DEFAULT true,
  popularity INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL NOT NULL,
  stall_id UUID REFERENCES stalls ON DELETE SET NULL NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'PENDING',
  payment_method TEXT DEFAULT 'CASH',
  special_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES menu_items ON DELETE SET NULL,
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL
);

-- 2. AUTOMATIC PROFILE TRIGGER
-- This ensures a profile row exists even before the user confirms their email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'name', 
    COALESCE(new.raw_user_meta_data->>'role', 'STUDENT')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists to avoid errors on re-run
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. RLS POLICIES

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable" ON profiles;
CREATE POLICY "Public profiles are viewable" ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Stalls
ALTER TABLE stalls ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view stalls" ON stalls;
CREATE POLICY "Anyone can view stalls" ON stalls FOR SELECT USING (true);
DROP POLICY IF EXISTS "Vendors can manage their own stalls" ON stalls;
CREATE POLICY "Vendors can manage their own stalls" ON stalls FOR ALL USING (auth.uid() = owner_id);

-- Menu Items
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view items" ON menu_items;
CREATE POLICY "Anyone can view items" ON menu_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Vendors can manage items" ON menu_items;
CREATE POLICY "Vendors can manage items" ON menu_items FOR ALL USING (
  EXISTS (SELECT 1 FROM stalls WHERE stalls.id = menu_items.stall_id AND stalls.owner_id = auth.uid())
);

-- Orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can create own orders" ON orders;
CREATE POLICY "Users can create own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Vendors can manage stall orders" ON orders;
CREATE POLICY "Vendors can manage stall orders" ON orders FOR ALL USING (
  EXISTS (SELECT 1 FROM stalls WHERE stalls.id = orders.stall_id AND stalls.owner_id = auth.uid())
);

-- Order Items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users view own items" ON order_items;
CREATE POLICY "Users view own items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
DROP POLICY IF EXISTS "Vendors view items" ON order_items;
CREATE POLICY "Vendors view items" ON order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM orders JOIN stalls ON stalls.id = orders.stall_id WHERE orders.id = order_items.order_id AND stalls.owner_id = auth.uid())
);
DROP POLICY IF EXISTS "Users insert items" ON order_items;
CREATE POLICY "Users insert items" ON order_items FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
);
