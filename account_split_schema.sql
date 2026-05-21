-- SPLIT ACCOUNT SCHEMA --
-- This SQL creates separate tables for Buyer and Vendor accounts

-- 1. Buyer Accounts (Students/Faculty)
CREATE TABLE IF NOT EXISTS buyer_accounts (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  student_id TEXT, -- Nullable for faculty if needed
  phone TEXT,
  department TEXT,
  dietary_prefs TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  budget_range TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Vendor Accounts
CREATE TABLE IF NOT EXISTS vendor_accounts (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  business_unit TEXT, -- Replaces 'department' for vendors
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: The 'stalls' table already exists and links to auth.users.id via owner_id
-- We might want to add a reference to vendor_accounts for clarity if preferred.

-- 3. UPDATED AUTOMATIC TRIGGER
-- This trigger now delegates user creation to the respective specialized table
CREATE OR REPLACE FUNCTION public.handle_new_user_split()
RETURNS trigger AS $$
BEGIN
  IF (new.raw_user_meta_data->>'role' = 'vendor') THEN
    INSERT INTO public.vendor_accounts (id, name, email, phone, business_unit)
    VALUES (
      new.id, 
      new.raw_user_meta_data->>'name', 
      new.email,
      new.raw_user_meta_data->>'phone',
      new.raw_user_meta_data->>'department'
    );
  ELSE
    INSERT INTO public.buyer_accounts (id, name, email, phone, department, student_id)
    VALUES (
      new.id, 
      new.raw_user_meta_data->>'name', 
      new.email,
      new.raw_user_meta_data->>'phone',
      new.raw_user_meta_data->>'department',
      new.raw_user_meta_data->>'student_id'
    );
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-link trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_split();

-- 4. RLS POLICIES FOR NEW TABLES

-- Buyer Accounts
ALTER TABLE buyer_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own buyer account" ON buyer_accounts FOR ALL USING (auth.uid() = id);
CREATE POLICY "Public can view basic buyer info" ON buyer_accounts FOR SELECT USING (true); -- Optional

-- Vendor Accounts
ALTER TABLE vendor_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own vendor account" ON vendor_accounts FOR ALL USING (auth.uid() = id);
CREATE POLICY "Public can view basic vendor info" ON vendor_accounts FOR SELECT USING (true);
