import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { LogOut, Package, Image, IndianRupee, Users, LayoutDashboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useMyRole, useSessionUser } from "@/lib/staff";

const links = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/banners", label: "Banners", icon: Image },
  { to: "/admin/upi", label: "UPI", icon: IndianRupee },
  { to: "/admin/staff", label: "Admins", icon: Users },
] as const;

export function AdminShell({ title, children }: { title: string; children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useSessionUser();
  const { data: role, isLoading } = useMyRole(user?.id);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/staff-9f2k", replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="sticky top-0 z-40 border-b border-border bg-card">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
          <Link to="/" className="font-display text-base font-extrabold lowercase text-primary">
            arman groceries
          </Link>
          <span className="rounded bg-accent px-2 py-0.5 text-[11px] font-bold uppercase text-accent-foreground">
            {role ?? "staff"}
          </span>
          <button
            type="button"
            onClick={signOut}
            className="ml-auto flex items-center gap-1 text-xs font-semibold text-muted-foreground"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
        <nav className="mx-auto flex max-w-4xl gap-1 overflow-x-auto px-3 pb-2">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold ${
                pathname === l.to
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <l.icon className="size-3.5" />
              {l.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-5">
        <h1 className="mb-4 font-display text-xl font-extrabold">{title}</h1>
        {isLoading ? (
          <div className="h-32 animate-pulse rounded-lg bg-muted" />
        ) : role ? (
          children
        ) : (
          <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            This account does not have store panel access. Ask the owner to add you as an admin.
          </div>
        )}
      </main>
    </div>
  );
}

export function useIsOwner() {
  const { user } = useSessionUser();
  const { data: role } = useMyRole(user?.id);
  return { isOwner: role === "owner", userId: user?.id };
}
