import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Pencil, Trash2, Link2, ClipboardPaste } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { productsQuery, uploadStoreImage } from "@/lib/products";
import { importProductFromText, importProductFromUrl, mirrorImage } from "@/lib/import.functions";
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
  const [description, setDescription] = useState("");
  const [highlights, setHighlights] = useState("");
  const [remoteImages, setRemoteImages] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const [importUrl, setImportUrl] = useState("");
  const [importText, setImportText] = useState("");
  const [importMode, setImportMode] = useState<"link" | "text">("link");
  const [importError, setImportError] = useState("");
  const [importNote, setImportNote] = useState("");

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  };

  const applyDraft = (draft: {
    title: string;
    price: number;
    mrp: number;
    description: string;
    highlights: string[];
    images: string[];
  }) => {
    setOpen(true);
    setError("");
    setImportError("");
    if (draft.title) setTitle(draft.title);
    if (draft.price) setPrice(String(draft.price));
    if (draft.mrp) setMrp(String(draft.mrp));
    if (draft.description) setDescription(draft.description);
    if (draft.highlights.length) setHighlights(draft.highlights.join("\n"));
    setRemoteImages(draft.images);
    setImportNote(
      draft.images.length
        ? `Imported ${draft.images.length} photo${draft.images.length > 1 ? "s" : ""} — everything below is editable.`
        : "Imported the details. Add a product photo below.",
    );
  };

  const runImport = useMutation({
    mutationFn: async () =>
      importMode === "link"
        ? importProductFromUrl({ data: { url: importUrl } })
        : importProductFromText({ data: { text: importText } }),
    onSuccess: applyDraft,
    onError: (e: Error) => {
      setImportNote("");
      setImportError(e.message);
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error("Enter a product title");
      if (!file && remoteImages.length === 0) throw new Error("Choose a product image");

      const gallery: string[] = [];
      for (const url of remoteImages) {
        try {
          const saved = await mirrorImage({ data: { url, folder: "products" } });
          gallery.push(saved.url);
        } catch {
          /* skip images that cannot be copied */
        }
      }
      if (file) gallery.unshift(await uploadStoreImage(file, "products"));
      if (gallery.length === 0) throw new Error("None of the product photos could be saved — upload one manually");

      const id = `${slugify(title)}-${Math.random().toString(36).slice(2, 6)}`;
      const { error: insertError } = await supabase.from("products").insert({
        id,
        title: title.trim(),
        image_url: gallery[0]!,
        price: Number(price) || 0,
        mrp: Number(mrp) || 0,
        description: description.trim(),
        highlights: highlights
          .split("\n")
          .map((h) => h.trim())
          .filter(Boolean),
        sort_order: products.length + 1,
      });
      if (insertError) throw insertError;

      if (gallery.length > 1) {
        await supabase.from("product_images").insert(
          gallery.map((url, i) => ({ product_id: id, image_url: url, sort_order: i })),
        );
      }
    },
    onSuccess: () => {
      setOpen(false);
      setTitle("");
      setFile(null);
      setDescription("");
      setHighlights("");
      setRemoteImages([]);
      setImportUrl("");
      setImportText("");
      setImportNote("");
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
      <section className="mb-4 space-y-3 rounded-xl border border-border bg-card p-4">
        <h2 className="text-sm font-bold">Auto-fetch a product</h2>
        <div className="flex gap-2">
          {(["link", "text"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => {
                setImportMode(mode);
                setImportError("");
              }}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold ${
                importMode === mode
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground"
              }`}
            >
              {mode === "link" ? <Link2 className="size-3.5" /> : <ClipboardPaste className="size-3.5" />}
              {mode === "link" ? "From link" : "Paste details"}
            </button>
          ))}
        </div>

        {importMode === "link" ? (
          <input
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            placeholder="https://www.meesho.com/…/p/xxxxx"
            className="input"
            inputMode="url"
          />
        ) : (
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            rows={5}
            placeholder="Open the product page, copy the title, price, MRP and description, and paste everything here."
            className="input"
          />
        )}

        <button
          type="button"
          disabled={runImport.isPending}
          onClick={() => runImport.mutate()}
          className="rounded-md bg-accent px-4 py-2 text-sm font-bold text-accent-foreground disabled:opacity-60"
        >
          {runImport.isPending ? "Fetching…" : "Fetch product"}
        </button>

        {importError && <p className="text-xs font-semibold text-destructive">{importError}</p>}
        {importNote && <p className="text-xs font-semibold text-success">{importNote}</p>}
        <p className="text-[11px] text-muted-foreground">
          Some shops (Meesho included) block automatic readers. If the link fails, switch to “Paste details”.
        </p>
      </section>

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
          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="input"
            />
          </Field>
          <Field label="Key features (one per line)">
            <textarea
              value={highlights}
              onChange={(e) => setHighlights(e.target.value)}
              rows={3}
              className="input"
            />
          </Field>
          {remoteImages.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-muted-foreground">Imported photos</span>
              <div className="mt-1 flex gap-2 overflow-x-auto">
                {remoteImages.map((src) => (
                  <div key={src} className="relative shrink-0">
                    <img src={src} alt="" className="size-16 rounded object-cover" />
                    <button
                      type="button"
                      aria-label="Remove imported photo"
                      onClick={() => setRemoteImages((list) => list.filter((u) => u !== src))}
                      className="absolute -right-1 -top-1 rounded-full bg-destructive p-0.5 text-destructive-foreground"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
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
