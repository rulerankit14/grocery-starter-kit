import { createFileRoute } from "@tanstack/react-router";
import { StaffLogin } from "@/components/admin/StaffLogin";

export const Route = createFileRoute("/$code")({
  head: () => ({
    meta: [
      { title: "Private Staff Access — Arman Groceries" },
      { name: "description", content: "Private sign-in link for an Arman Groceries store admin." },
      { property: "og:title", content: "Private Staff Access — Arman Groceries" },
      { property: "og:description", content: "Private admin access for the Arman Groceries store." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CodeLoginPage,
});

function CodeLoginPage() {
  const { code } = Route.useParams();
  return <StaffLogin code={code} redirectPath={`/${code}`} />;
}
