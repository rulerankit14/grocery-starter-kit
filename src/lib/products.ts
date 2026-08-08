import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ReviewImage = {
  id: string;
  imageUrl: string;
  caption: string | null;
};

export type Product = {
  id: string;
  title: string;
  image: string;
  price: number;
  mrp: number;
  rating: number;
  ratingCount: number;
  freeDelivery: boolean;
  description: string;
  highlights: string[];
  active: boolean;
  sortOrder: number;
};

export type Banner = {
  id: string;
  imageUrl: string;
  title: string;
  badge: string;
  active: boolean;
  sortOrder: number;
};

export type StoreSettings = {
  upiId: string;
  upiName: string;
};

type ProductRow = {
  id: string;
  title: string;
  image_url: string;
  price: number;
  mrp: number;
  rating: number;
  rating_count: number;
  free_delivery: boolean;
  description: string;
  highlights: string[];
  active: boolean;
  sort_order: number;
};

const CATALOG_KEY = "arman-catalog-v1";
const cache = new Map<string, Product>();
let hydrated = false;

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(CATALOG_KEY);
    if (!raw) return;
    for (const p of JSON.parse(raw) as Product[]) cache.set(p.id, p);
  } catch {
    /* ignore */
  }
}

function remember(list: Product[]) {
  for (const p of list) cache.set(p.id, p);
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CATALOG_KEY, JSON.stringify([...cache.values()]));
  } catch {
    /* ignore */
  }
}

/** Synchronous lookup used by the cart; backed by the last fetched catalogue. */
export function getProduct(id: string): Product | undefined {
  hydrate();
  return cache.get(id);
}

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    title: row.title,
    image: row.image_url,
    price: row.price,
    mrp: row.mrp,
    rating: Number(row.rating),
    ratingCount: row.rating_count,
    freeDelivery: row.free_delivery,
    description: row.description,
    highlights: row.highlights ?? [],
    active: row.active,
    sortOrder: row.sort_order,
  };
}

export async function fetchProducts(includeInactive = false): Promise<Product[]> {
  let query = supabase.from("products").select("*").order("sort_order", { ascending: true });
  if (!includeInactive) query = query.eq("active", true);
  const { data, error } = await query;
  if (error) throw error;
  const list = (data as ProductRow[]).map(mapProduct);
  remember(list);
  return list;
}

export async function fetchProduct(id: string): Promise<Product | null> {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const product = mapProduct(data as ProductRow);
  remember([product]);
  return product;
}

export async function fetchReviews(productId: string): Promise<ReviewImage[]> {
  const { data, error } = await supabase
    .from("product_reviews")
    .select("id, image_url, caption")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id as string,
    imageUrl: r.image_url as string,
    caption: (r.caption as string | null) ?? null,
  }));
}

export async function fetchBanners(includeInactive = false): Promise<Banner[]> {
  let query = supabase.from("banners").select("*").order("sort_order", { ascending: true });
  if (!includeInactive) query = query.eq("active", true);
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map((b) => ({
    id: b.id as string,
    imageUrl: b.image_url as string,
    title: b.title as string,
    badge: b.badge as string,
    active: b.active as boolean,
    sortOrder: b.sort_order as number,
  }));
}

export async function fetchSettings(): Promise<StoreSettings> {
  const { data, error } = await supabase
    .from("store_settings")
    .select("upi_id, upi_name")
    .eq("id", true)
    .maybeSingle();
  if (error) throw error;
  return { upiId: (data?.upi_id as string) ?? "", upiName: (data?.upi_name as string) ?? "" };
}

export const productsQuery = (includeInactive = false) =>
  queryOptions({
    queryKey: ["products", includeInactive],
    queryFn: () => fetchProducts(includeInactive),
  });

export const productQuery = (id: string) =>
  queryOptions({ queryKey: ["product", id], queryFn: () => fetchProduct(id) });

export const reviewsQuery = (id: string) =>
  queryOptions({ queryKey: ["reviews", id], queryFn: () => fetchReviews(id) });

export const bannersQuery = (includeInactive = false) =>
  queryOptions({
    queryKey: ["banners", includeInactive],
    queryFn: () => fetchBanners(includeInactive),
  });

export const settingsQuery = () =>
  queryOptions({ queryKey: ["store-settings"], queryFn: fetchSettings });

export function discountPercent(price: number, mrp: number) {
  if (!mrp) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

/** Uploads an image to the private store bucket and returns an app-served URL. */
export async function uploadStoreImage(file: File, folder: string): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("store").upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type || "image/jpeg",
  });
  if (error) throw error;
  return `/api/public/img/${path}`;
}
