-- 1. REMOVE OLD DATA (Campus Bytes)
DELETE FROM menu_items WHERE stall_id IN (SELECT id FROM stalls WHERE name = 'Campus Bytes');
DELETE FROM stalls WHERE name = 'Campus Bytes';

-- 2. INSERT FEATURED STALLS
INSERT INTO stalls (id, name, description, image_url, category, is_open, rating, total_ratings)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Strips & Dip Co.', 'Every dip of strip, makes your mouth drip. Premium chicken strips with signature sauces.', '/logos/strips_dip.png', 'Snacks', true, 4.9, 250),
  ('00000000-0000-0000-0000-000000000002', 'Kapi Kita', 'Your neighborhood coffee companion. Freshly brewed local beans and signature lattes.', '/logos/kapi_kita.png', 'Drinks', true, 4.8, 180)
ON CONFLICT (id) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url;

-- 3. INSERT MENU ITEMS for Strips & Dip Co.
INSERT INTO menu_items (stall_id, name, price, category, is_available, popularity)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Classic Chicken Strips (3 pcs)', 120.00, 'Mains', true, 95),
  ('00000000-0000-0000-0000-000000000001', 'Large Chicken Strips (5 pcs)', 180.00, 'Mains', true, 88),
  ('00000000-0000-0000-0000-000000000001', 'Strip Box with Rice', 150.00, 'Mains', true, 92),
  ('00000000-0000-0000-0000-000000000001', 'Extra Garlic Dip', 25.00, 'Extras', true, 75),
  ('00000000-0000-0000-0000-000000000001', 'Extra Honey Mustard', 25.00, 'Extras', true, 70),
  ('00000000-0000-0000-0000-000000000001', 'Iced Tea', 40.00, 'Drinks', true, 85)
ON CONFLICT DO NOTHING;

-- 4. INSERT MENU ITEMS for Kapi Kita
INSERT INTO menu_items (stall_id, name, price, category, is_available, popularity)
VALUES
  ('00000000-0000-0000-0000-000000000002', 'Barako Coffee', 60.00, 'Coffee', true, 80),
  ('00000000-0000-0000-0000-000000000002', 'Spanish Latte', 95.00, 'Coffee', true, 94),
  ('00000000-0000-0000-0000-000000000002', 'Sea Salt Latte', 110.00, 'Coffee', true, 98),
  ('00000000-0000-0000-0000-000000000002', 'Caramel Macchiato', 105.00, 'Coffee', true, 91),
  ('00000000-0000-0000-0000-000000000002', 'Pastry of the Day', 75.00, 'Pastries', true, 75)
ON CONFLICT DO NOTHING;

-- 5. AUTO-CONFIRM TRIGGER
CREATE OR REPLACE FUNCTION public.auto_confirm_featured_orders()
RETURNS trigger AS $$
BEGIN
  IF NEW.stall_id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002') THEN
    NEW.status := 'ACCEPTED';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_auto_confirm_featured_orders ON orders;
CREATE TRIGGER tr_auto_confirm_featured_orders
  BEFORE INSERT ON orders
  FOR EACH ROW EXECUTE PROCEDURE public.auto_confirm_featured_orders();
