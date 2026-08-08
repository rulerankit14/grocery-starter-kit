import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/store/Logo";
import { claimOwnership } from "@/lib/admin.functions";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Staff Sign In — Arman Groceries" },
      { name: "description", content: "Sign in to the Arman Groceries admin panel to manage products, banners, UPI and reviews." },
      { property: "og:title", content: "Staff Sign In — Arman Groceries" },
      { property: "og:description", content: "Owner and admin access to the Arman Groceries store panel." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin + "/auth" },
        });
        if (signUpError) throw signUpError;
        if (!data.session) {
          setNotice("Account created. Check your email to confirm, then sign in.");
          setMode("signin");
          return;
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signInError) throw signInError;
      }
      await claimOwnership().catch(() => undefined);
      navigate({ to: "/admin", replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="border-b border-border bg-card px-4 py-3">
        <Link to="/">
          <Logo />
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Lock className="size-5 text-primary" />
            <h1 className="font-display text-xl font-extrabold">Store Panel</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Sign in with your owner or admin account."
              : "Create the owner account for your store."}
          </p>

          <form onSubmit={submit} className="mt-5 space-y-3">
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Email</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="you@example.com"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-muted-foreground">Password</span>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="At least 8 characters"
              />
            </label>

            {error && <p className="text-xs font-semibold text-destructive">{error}</p>}
            {notice && <p className="text-xs font-semibold text-success">{notice}</p>}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Owner Account"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError("");
              setNotice("");
            }}
            className="mt-4 w-full text-center text-xs font-semibold text-primary"
          >
            {mode === "signin"
              ? "First time? Create the owner account"
              : "Already have an account? Sign in"}
          </button>
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          The first account created becomes the store owner. Admins are added by the owner from the panel.
        </p>
      </main>
    </div>
  );
}
