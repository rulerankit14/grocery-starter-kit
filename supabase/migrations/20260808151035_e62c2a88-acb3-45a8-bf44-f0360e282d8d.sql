-- Roles
CREATE TYPE public.app_role AS ENUM ('owner', 'admin');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY,
  email text,
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id);
$$;

CREATE POLICY "profiles_select_self_or_staff" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "profiles_upsert_self" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update_self" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "user_roles_select" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'owner'));

-- First signed-in user becomes owner
CREATE OR REPLACE FUNCTION public.bootstrap_owner()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE claimed boolean := false;
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'owner') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (auth.uid(), 'owner')
      ON CONFLICT DO NOTHING;
    claimed := true;
  END IF;
  RETURN claimed;
END;
$$;
GRANT EXECUTE ON FUNCTION public.bootstrap_owner() TO authenticated;

-- Products
CREATE TABLE public.products (
  id text PRIMARY KEY,
  title text NOT NULL,
  image_url text NOT NULL DEFAULT '',
  price integer NOT NULL DEFAULT 0,
  mrp integer NOT NULL DEFAULT 0,
  rating numeric(2,1) NOT NULL DEFAULT 4.2,
  rating_count integer NOT NULL DEFAULT 0,
  free_delivery boolean NOT NULL DEFAULT true,
  description text NOT NULL DEFAULT '',
  highlights text[] NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_public_read" ON public.products FOR SELECT TO anon, authenticated USING (active OR public.is_staff(auth.uid()));
CREATE POLICY "products_staff_write" ON public.products FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id text NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  caption text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_reviews TO authenticated;
GRANT ALL ON public.product_reviews TO service_role;
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_public_read" ON public.product_reviews FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "reviews_staff_write" ON public.product_reviews FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title text NOT NULL DEFAULT '',
  badge text NOT NULL DEFAULT '',
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.banners TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.banners TO authenticated;
GRANT ALL ON public.banners TO service_role;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "banners_public_read" ON public.banners FOR SELECT TO anon, authenticated USING (active OR public.is_staff(auth.uid()));
CREATE POLICY "banners_staff_write" ON public.banners FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE TABLE public.store_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  upi_id text NOT NULL DEFAULT '',
  upi_name text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.store_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.store_settings TO authenticated;
GRANT ALL ON public.store_settings TO service_role;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_public_read" ON public.store_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "settings_staff_write" ON public.store_settings FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

INSERT INTO public.store_settings (id, upi_id, upi_name) VALUES (true, 'armangroceries@upi', 'Arman Groceries');

-- Storage policies (private bucket, images served through the app)
CREATE POLICY "store_images_staff_all" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'store' AND public.is_staff(auth.uid()))
  WITH CHECK (bucket_id = 'store' AND public.is_staff(auth.uid()));

-- Seed current catalogue
INSERT INTO public.products (id, title, image_url, price, mrp, rating, rating_count, free_delivery, description, highlights, sort_order) VALUES
('mix-dry-fruits-4kg', 'Premium 4KG Mix Dry Fruits Combo - Almonds, Cashews, Pistachios & Kishmish (1KG Each)', '/api/public/img/seed/dryfruits.jpg', 199, 5999, 4.4, 4320, true, 'Upgrade your daily nutrition with this value-packed 4 kg dry fruits combo. Each pack contains 1 kg each of almonds, cashews, pistachios and kishmish, carefully sorted and hygienically packed to lock in freshness.', ARRAY['Best for daily use, festive gifting and snacking','4 varieties in one pack - almonds, cashews, pistachios, kishmish','1 KG each - total 4 KG value pack','Rich in protein, fibre and healthy fats','Hygienically packed and sealed for freshness'], 1),
('essential-grocery-combo', 'Essential Grocery Mega Saver Combo - Atta 10KG, Basmati Rice 5KG, Refined Oil 5L & Sugar 5KG', '/api/public/img/seed/grocery-combo.jpg', 199, 2499, 4.2, 2871, true, 'A complete monthly kitchen combo covering your everyday essentials - chakki fresh atta, long grain basmati rice, refined soya oil and fine grain sugar, all in one saver pack.', ARRAY['Chakki fresh atta 10 KG','Long grain basmati rice 5 KG','Refined soya health oil 5 Litre','Fine grain sugar 5 KG','Ideal one-shot monthly ration pack'], 2),
('masala-spice-combo', 'Everyday Masala Combo Pack - Turmeric, Red Chilli, Coriander & Garam Masala (500g Each)', '/api/public/img/seed/spices.jpg', 149, 999, 4.3, 1642, true, 'Four kitchen staple masalas ground fresh and packed airtight. Strong aroma, natural colour and no added artificial flavour.', ARRAY['4 essential masalas in one box','500 g each - 2 KG total','Fresh ground, strong aroma','Airtight resealable packs'], 3),
('household-care-combo', 'Household Cleaning Combo - Detergent Powder 5KG, Dishwash Liquid 1L & 5 Soap Bars', '/api/public/img/seed/household.jpg', 189, 1299, 4.1, 987, false, 'Everything you need to keep the home spotless - a bulk detergent powder pack, a lemon dishwash liquid and a set of five soap bars.', ARRAY['Detergent powder 5 KG','Lemon dishwash liquid 1 Litre','5 laundry soap bars','Tough on stains, gentle on hands'], 4),
('tea-coffee-combo', 'Tea, Coffee & Biscuit Saver Combo - Assam Tea 1KG, Coffee 200g & 6 Biscuit Packs', '/api/public/img/seed/beverages.jpg', 179, 1099, 4.5, 2114, true, 'Strong Assam tea leaves, rich instant coffee and a set of six biscuit packs - the perfect chai-time bundle for the whole family.', ARRAY['Assam CTC tea 1 KG','Instant coffee 200 g','6 assorted biscuit packs','Great value chai-time bundle'], 5);

INSERT INTO public.banners (image_url, title, badge, sort_order) VALUES
('/api/public/img/seed/banner-grains.jpg', 'Foodgrains, Oils & Ghee', 'UP TO 60% OFF', 1);