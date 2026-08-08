import { createFileRoute } from "@tanstack/react-router";
import { StaffLogin } from "@/components/admin/StaffLogin";

export const Route = createFileRoute("/staff-9f2k")({
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
  component: () => <StaffLogin redirectPath="/staff-9f2k" />,
});
