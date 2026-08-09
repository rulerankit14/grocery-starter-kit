import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Trash2, Upload } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { productImagesQuery, productQuery, reviewsQuery, uploadStoreImage } from "@/lib/products";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/products/$id")({
  head: () => ({
    meta: [
      { title: "Edit Product — Arman Groceries Admin" },
      { name: "description", content: "Edit product details, pricing, highlights and review screenshots." },
      { property: "og:title", content: "Edit Product — Arman Groceries Admin" },
      { property: "og:description", content: "Product editor for the Arman Groceries store panel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditProduct,
});

function EditProduct() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const { data: product } = useQuery(productQuery(id));
  const { data: reviews = [] } = useQuery(reviewsQuery(id));

  const [form, setForm] = useState({
    title: "",
    price: "0",
    mrp: "0",
    rating: "4.2",
    ratingCount: "0",
    freeDelivery: true,
    description: "",
    highlights: "",
  });
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!product) return;
    setForm({
      title: product.title,
      price: String(product.price),
      mrp: String(product.mrp),
      rating: String(product.rating),
      ratingCount: String(product.ratingCount),
      freeDelivery: product.freeDelivery,
      description: product.description,
      highlights: product.highlights.join("\n"),
    });
  }, [product]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("products")
        .update({
          title: form.title.trim(),
          price: Number(form.price) || 0,
          mrp: Number(form.mrp) || 0,
          rating: Number(form.rating) || 0,
          rating_count: Number(form.ratingCount) || 0,
          free_delivery: form.freeDelivery,
          description: form.description,
          highlights: form.highlights.split("\n").map((h) => h.trim()).filter(Boolean),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      setStatus("Saved");
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setTimeout(() => setStatus(""), 2000);
    },
    onError: (e: Error) => setStatus(e.message),
  });

  const changeImage = useMutation({
    mutationFn: async (file: File) => {
      const url = await uploadStoreImage(file, "products");
      const { error } = await supabase.from("products").update({ image_url: url }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["product", id] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const addReview = useMutation({
    mutationFn: async (files: FileList) => {
      let order = reviews.length;
      for (const file of Array.from(files)) {
        const url = await uploadStoreImage(file, "reviews");
        const { error } = await supabase
          .from("product_reviews")
          .insert({ product_id: id, image_url: url, sort_order: ++order });
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews", id] }),
  });

  const removeReview = useMutation({
    mutationFn: async (reviewId: string) => {
      const { error } = await supabase.from("product_reviews").delete().eq("id", reviewId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["reviews", id] }),
  });

  const addGallery = useMutation({
    mutationFn: async (files: FileList) => {
      let order = gallery.length;
      for (const file of Array.from(files)) {
        const url = await uploadStoreImage(file, "products");
        const { error } = await supabase
          .from("product_images")
          .insert({ product_id: id, image_url: url, sort_order: ++order });
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["product-images", id] }),
  });

  const removeGallery = useMutation({
    mutationFn: async (imageId: string) => {
      const { error } = await supabase.from("product_images").delete().eq("id", imageId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["product-images", id] }),
  });


  return (
    <AdminShell title="Edit Product">
      {!product ? (
        <div className="h-40 animate-pulse rounded-lg bg-muted" />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
            <img src={product.image} alt="" className="size-20 rounded object-cover" />
            <label className="flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-3 py-2 text-xs font-bold">
              <Upload className="size-4" />
              {changeImage.isPending ? "Uploading…" : "Replace image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) changeImage.mutate(f);
                }}
              />
            </label>
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            <Field label="Title">
              <input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="input"
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Price ₹">
                <input
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="input"
                  inputMode="numeric"
                />
              </Field>
              <Field label="MRP ₹">
                <input
                  value={form.mrp}
                  onChange={(e) => setForm({ ...form, mrp: e.target.value })}
                  className="input"
                  inputMode="numeric"
                />
              </Field>
              <Field label="Rating">
                <input
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: e.target.value })}
                  className="input"
                  inputMode="decimal"
                />
              </Field>
              <Field label="Rating count">
                <input
                  value={form.ratingCount}
                  onChange={(e) => setForm({ ...form, ratingCount: e.target.value })}
                  className="input"
                  inputMode="numeric"
                />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.freeDelivery}
                onChange={(e) => setForm({ ...form, freeDelivery: e.target.checked })}
              />
              Free delivery
            </label>
            <Field label="Description">
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Key features (one per line)">
              <textarea
                rows={5}
                value={form.highlights}
                onChange={(e) => setForm({ ...form, highlights: e.target.value })}
                className="input"
              />
            </Field>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => save.mutate()}
                disabled={save.isPending}
                className="rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
              >
                {save.isPending ? "Saving…" : "Save changes"}
              </button>
              {status && <span className="text-xs font-semibold text-success">{status}</span>}
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            <h2 className="font-display text-base font-bold">Review screenshots</h2>
            <label className="flex w-fit cursor-pointer items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-xs font-bold text-primary-foreground">
              <Upload className="size-4" />
              {addReview.isPending ? "Uploading…" : "Upload screenshots"}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length) addReview.mutate(files);
                }}
              />
            </label>
            <div className="grid grid-cols-3 gap-2">
              {reviews.map((r) => (
                <div key={r.id} className="relative overflow-hidden rounded-lg border border-border">
                  <img src={r.imageUrl} alt="Review screenshot" className="w-full object-cover" />
                  <button
                    type="button"
                    aria-label="Delete review"
                    onClick={() => removeReview.mutate(r.id)}
                    className="absolute right-1 top-1 rounded bg-destructive p-1 text-destructive-foreground"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
