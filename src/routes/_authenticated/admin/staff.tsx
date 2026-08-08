import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { AdminShell, useIsOwner } from "@/components/admin/AdminShell";
import { addAdmin, listStaff, removeAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/staff")({
  head: () => ({
    meta: [
      { title: "Manage Admins — Arman Groceries Admin" },
      { name: "description", content: "Owner tools to add or remove admin accounts for the Arman Groceries store." },
      { property: "og:title", content: "Manage Admins — Arman Groceries Admin" },
      { property: "og:description", content: "Add and remove store admins." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminStaff,
});

function AdminStaff() {
  const queryClient = useQueryClient();
  const { isOwner } = useIsOwner();
  const staff = useQuery({
    queryKey: ["staff"],
    enabled: isOwner,
    queryFn: () => listStaff(),
  });

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const create = useMutation({
    mutationFn: () => addAdmin({ data: { email, password, fullName } }),
    onSuccess: () => {
      setEmail("");
      setFullName("");
      setPassword("");
      setError("");
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
    onError: (e: Error) => setError(e.message),
  });

  const drop = useMutation({
    mutationFn: (userId: string) => removeAdmin({ data: { userId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["staff"] }),
    onError: (e: Error) => setError(e.message),
  });

  if (!isOwner) {
    return (
      <AdminShell title="Admins">
        <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
          Only the store owner can add or remove admins.
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Admins">
      <div className="mb-4 space-y-3 rounded-xl border border-border bg-card p-4">
        <h2 className="font-display text-base font-bold">Add a new admin</h2>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Full name"
          className="input"
        />
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          className="input"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Temporary password (min 8 characters)"
          type="text"
          className="input"
        />
        {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
        <button
          type="button"
          onClick={() => create.mutate()}
          disabled={create.isPending}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-60"
        >
          {create.isPending ? "Creating…" : "Create admin"}
        </button>
      </div>

      <ul className="space-y-2">
        {(staff.data ?? []).map((m) => (
          <li key={m.userId} className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{m.fullName || m.email}</p>
              <p className="truncate text-xs text-muted-foreground">{m.email}</p>
            </div>
            <span className="rounded bg-accent px-2 py-0.5 text-[11px] font-bold uppercase text-accent-foreground">
              {m.role}
            </span>
            {m.role !== "owner" && (
              <button
                type="button"
                aria-label="Remove admin"
                onClick={() => {
                  if (confirm(`Remove ${m.email}?`)) drop.mutate(m.userId);
                }}
                className="rounded bg-destructive/10 p-2 text-destructive"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </li>
        ))}
      </ul>
    </AdminShell>
  );
}
