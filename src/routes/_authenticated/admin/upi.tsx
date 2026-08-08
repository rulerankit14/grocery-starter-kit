import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { settingsQuery } from "@/lib/products";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/upi")({
  head: () => ({
    meta: [
      { title: "Manage UPI — Arman Groceries Admin" },
      { name: "description", content: "Update the UPI ID and payee name shown to customers at checkout." },
      { property: "og:title", content: "Manage UPI — Arman Groceries Admin" },
      { property: "og:description", content: "UPI payment settings for the Arman Groceries store." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminUpi,
});

function AdminUpi() {
  const queryClient = useQueryClient();
  const { data: settings } = useQuery(settingsQuery());
  const [upiId, setUpiId] = useState("");
  const [upiName, setUpiName] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!settings) return;
    setUpiId(settings.upiId);
    setUpiName(settings.upiName);
  }, [settings]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("store_settings")
        .update({ upi_id: upiId.trim(), upi_name: upiName.trim(), updated_at: new Date().toISOString() })
        .eq("id", true);
      if (error) throw error;
    },
    onSuccess: () => {
      setStatus("Saved");
      queryClient.invalidateQueries({ queryKey: ["store-settings"] });
      setTimeout(() => setStatus(""), 2000);
    },
    onError: (e: Error) => setStatus(e.message),
  });

  return (
    <AdminShell title="UPI Settings">
      <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">UPI ID</span>
          <input
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="yourstore@upi"
            className="input mt-1"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-muted-foreground">Payee name</span>
          <input value={upiName} onChange={(e) => setUpiName(e.target.value)} className="input mt-1" />
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => save.mutate()}
            disabled={save.isPending}
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
          >
            {save.isPending ? "Saving…" : "Save"}
          </button>
          {status && <span className="text-xs font-semibold text-success">{status}</span>}
        </div>
      </div>
    </AdminShell>
  );
}
