import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { bannersQuery, uploadStoreImage } from "@/lib/products";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/banners")({
  head: () => ({
    meta: [
      { title: "Manage Banners — Arman Groceries Admin" },
      { name: "description", content: "Upload, show, hide and delete homepage banners for Arman Groceries." },
      { property: "og:title", content: "Manage Banners — Arman Groceries Admin" },
      { property: "og:description", content: "Homepage banner management for the store panel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminBanners,
});

function AdminBanners() {
  const queryClient = useQueryClient();
  const { data: banners = [] } = useQuery(bannersQuery(true));
  const [title, setTitle] = useState("");
  const [badge, setBadge] = useState("UP TO 60% OFF");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["banners"] });

  const create = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Choose a banner image");
      const imageUrl = await uploadStoreImage(file, "banners");
      const { error: e } = await supabase.from("banners").insert({
        image_url: imageUrl,
        title: title.trim(),
        badge: badge.trim(),
        sort_order: banners.length + 1,
      });
      if (e) throw e;
    },
    onSuccess: () => {
      setFile(null);
      setTitle("");
      setError("");
      invalidate();
    },
    onError: (e: Error) => setError(e.message),
  });

  const toggle = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error: e } = await supabase.from("banners").update({ active }).eq("id", id);
      if (e) throw e;
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error: e } = await supabase.from("banners").delete().eq("id", id);
      if (e) throw e;
    },
    onSuccess: invalidate,
  });

  return (
    <AdminShell title="Banners">
      <div className="mb-4 space-y-3 rounded-xl border border-border bg-card p-4">
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Banner title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="input mt-1" />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Badge text</span>
          <input value={badge} onChange={(e) => setBadge(e.target.value)} className="input mt-1" />
        </label>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-xs" />
        {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
        <button
          type="button"
          onClick={() => create.mutate()}
          disabled={create.isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground disabled:opacity-60"
        >
          {create.isPending ? "Uploading…" : "Add banner"}
        </button>
      </div>

      <ul className="space-y-2">
        {banners.map((b) => (
          <li key={b.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
            <img src={b.imageUrl} alt="" className="h-14 w-24 shrink-0 rounded object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{b.title || "Untitled"}</p>
              <p className="text-xs text-muted-foreground">{b.badge} {b.active ? "" : "· Hidden"}</p>
            </div>
            <button
              type="button"
              onClick={() => toggle.mutate({ id: b.id, active: !b.active })}
              className="rounded border border-border px-2 py-1 text-[11px] font-bold"
            >
              {b.active ? "Hide" : "Show"}
            </button>
            <button
              type="button"
              aria-label="Delete banner"
              onClick={() => remove.mutate(b.id)}
              className="rounded bg-destructive/10 p-2 text-destructive"
            >
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
