import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

export const Route = createFileRoute("/api/public/img/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = (params as { _splat?: string })._splat ?? "";
        if (!path || path.includes("..")) return new Response("Not found", { status: 404 });

        const url = process.env["SUPABASE_URL"] ?? import.meta.env["VITE_SUPABASE_URL"];
        const key =
          process.env["SUPABASE_PUBLISHABLE_KEY"] ??
          process.env["SUPABASE_ANON_KEY"] ??
          import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
        if (!url || !key) return new Response("Not configured", { status: 500 });

        const supabase = createClient(url, key, {
          global: {
            fetch: (input, init) => {
              const headers = new Headers(init?.headers);
              headers.delete("Authorization");
              headers.set("apikey", key);
              return fetch(input, { ...init, headers });
            },
          },
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const { data, error } = await supabase.storage.from("store").download(path);
        if (error || !data) return new Response("Not found", { status: 404 });

        return new Response(await data.arrayBuffer(), {
          headers: {
            "content-type": data.type || "image/jpeg",
            "cache-control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
