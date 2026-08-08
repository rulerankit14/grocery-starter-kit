import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { productsQuery, uploadStoreImage } from "@/lib/products";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/products/")({
  head: () => ({
    meta: [
      { title: "Manage Products — Arman Groceries Admin" },
      { name: "description", content: "Add, edit, hide and delete products in the Arman Groceries catalogue." },
      { property: "og:title", content: "Manage Products — Arman Groceries Admin" },
      { property: "og:description", content: "Product management for the Arman Groceries store." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminProducts,
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function AdminProducts() {
  const queryClient = useQueryClient();
  const { data: products = [], isLoading } = useQuery(productsQuery(true));
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("199");
  const [mrp, setMrp] = useState("999");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const create = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error("Enter a product title");
      if (!file) throw new Error("Choose a product image");
      const imageUrl = await uploadStoreImage(file, "products");
      const id = `${slugify(title)}-${Math.random().toString(36).slice(2, 6)}`;
      const { error: insertError } = await supabase.from("products").insert({
        id,
        title: title.trim(),
        image_url: imageUrl,
        price: Number(price) || 0,
        mrp: Number(mrp) || 0,
        sort_order: products.length + 1,
      });
      if (insertError) throw insertError;
    },
    onSuccess: () => {
      setOpen(false);
      setTitle("");
      setFile(null);
      setError("");
      invalidate();
    },
    onError: (e: Error) => setError(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error: e } = await supabase.from("products").update({ active }).eq("id", id);
      if (e) throw e;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error: e } = await supabase.from("products").delete().eq("id", id);
      if (e) throw e;
    },
    onSuccess: invalidate,
  });

  return (
    <AdminShell title="Products">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mb-4 flex items-center gap-1.5 rounded-md bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"
      >
        <Plus className="size-4" /> Add Product
      </button>

      {open && (
        <div className="mb-4 space-y-3 rounded-xl border border-border bg-card p-4">
          <Field label="Title">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={160}
              className="input"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Price ₹">
              <input value={price} onChange={(e) => setPrice(e.target.value)} className="input" inputMode="numeric" />
            </Field>
            <Field label="MRP ₹">
              <input value={mrp} onChange={(e) => setMrp(e.target.value)} className="input" inputMode="numeric" />
            </Field>
          </div>
          <Field label="Image">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-xs"
            />
          </Field>
          {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
          <button
            type="button"
            disabled={create.isPending}
            onClick={() => create.mutate()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {create.isPending ? "Saving…" : "Create product"}
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="h-40 animate-pulse rounded-lg bg-muted" />
      ) : (
        <ul className="space-y-2">
          {products.map((p) => (
            <li
              key={p.id}
              className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
            >
              <img src={p.image} alt="" className="size-14 shrink-0 rounded object-cover" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-xs font-semibold">{p.title}</p>
                <p className="text-xs text-muted-foreground">
                  ₹{p.price} · MRP ₹{p.mrp} {p.active ? "" : "· Hidden"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleActive.mutate({ id: p.id, active: !p.active })}
                className="rounded border border-border px-2 py-1 text-[11px] font-bold"
              >
                {p.active ? "Hide" : "Show"}
              </button>
              <Link
                to="/admin/products/$id"
                params={{ id: p.id }}
                className="rounded bg-accent p-2 text-accent-foreground"
                aria-label="Edit product"
              >
                <Pencil className="size-4" />
              </Link>
              <button
                type="button"
                aria-label="Delete product"
                onClick={() => {
                  if (confirm("Delete this product?")) remove.mutate(p.id);
                }}
                className="rounded bg-destructive/10 p-2 text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          ))}
        </ul>
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
