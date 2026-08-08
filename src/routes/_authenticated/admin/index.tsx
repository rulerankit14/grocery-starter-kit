import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Package, Image, IndianRupee, Users } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { bannersQuery, productsQuery, settingsQuery } from "@/lib/products";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Store Dashboard — Arman Groceries Admin" },
      { name: "description", content: "Manage products, banners, UPI details, reviews and admins for Arman Groceries." },
      { property: "og:title", content: "Store Dashboard — Arman Groceries Admin" },
      { property: "og:description", content: "Owner and admin control panel for the Arman Groceries store." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminHome,
});

function AdminHome() {
  const { data: products = [] } = useQuery(productsQuery(true));
  const { data: banners = [] } = useQuery(bannersQuery(true));
  const { data: settings } = useQuery(settingsQuery());

  return (
    <AdminShell title="Dashboard">
      <div className="grid grid-cols-2 gap-3">
        <Card to="/admin/products" icon={Package} label="Products" value={`${products.length}`} />
        <Card to="/admin/banners" icon={Image} label="Banners" value={`${banners.length}`} />
        <Card to="/admin/upi" icon={IndianRupee} label="UPI ID" value={settings?.upiId || "Not set"} />
        <Card to="/admin/staff" icon={Users} label="Admins" value="Manage" />
      </div>
    </AdminShell>
  );
}

function Card({
  to,
  icon: Icon,
  label,
  value,
}: {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary"
    >
      <Icon className="size-5 text-primary" />
      <p className="mt-3 text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="truncate font-display text-lg font-extrabold">{value}</p>
    </Link>
  );
}
