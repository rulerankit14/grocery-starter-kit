DROP POLICY "products_public_read" ON public.products;
DROP POLICY "products_staff_write" ON public.products;
DROP POLICY "reviews_staff_write" ON public.product_reviews;
DROP POLICY "banners_public_read" ON public.banners;
DROP POLICY "banners_staff_write" ON public.banners;
DROP POLICY "settings_staff_write" ON public.store_settings;
DROP POLICY "profiles_select_self_or_staff" ON public.profiles;
DROP POLICY "store_images_staff_all" ON storage.objects;

CREATE POLICY "products_public_read" ON public.products FOR SELECT TO anon, authenticated
  USING (active OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid()));
CREATE POLICY "products_staff_write" ON public.products FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid()));

CREATE POLICY "reviews_staff_write" ON public.product_reviews FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid()));

CREATE POLICY "banners_public_read" ON public.banners FOR SELECT TO anon, authenticated
  USING (active OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid()));
CREATE POLICY "banners_staff_write" ON public.banners FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid()));

CREATE POLICY "settings_staff_write" ON public.store_settings FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid()));

CREATE POLICY "profiles_select_self_or_staff" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid()));

CREATE POLICY "store_images_staff_all" ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'store' AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid()))
  WITH CHECK (bucket_id = 'store' AND EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid()));