import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ProductDraft = {
  title: string;
  price: number;
  mrp: number;
  description: string;
  highlights: string[];
  images: string[];
  source: "link" | "text";
  warning?: string;
};

const DRAFT_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    price: { type: "number", description: "current selling price in rupees" },
    mrp: { type: "number", description: "original / struck-through price in rupees" },
    description: { type: "string" },
    highlights: { type: "array", items: { type: "string" } },
    images: { type: "array", items: { type: "string" }, description: "absolute product image URLs" },
  },
  required: ["title"],
} as const;

function toNumber(value: unknown): number {
  const n = Number(String(value ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? Math.round(n) : 0;
}

function normalise(raw: Record<string, unknown>, source: "link" | "text"): ProductDraft {
  const images = Array.isArray(raw['images'])
    ? (raw['images'] as unknown[])
        .map((v) => String(v))
        .filter((v) => /^https?:\/\//i.test(v))
        .slice(0, 8)
    : [];
  const highlights = Array.isArray(raw['highlights'])
    ? (raw['highlights'] as unknown[]).map((v) => String(v).slice(0, 140)).slice(0, 8)
    : [];
  const price = toNumber(raw['price']);
  const mrp = toNumber(raw['mrp']);
  return {
    title: String(raw['title'] ?? "").slice(0, 160),
    price,
    mrp: mrp > price ? mrp : Math.round(price * 3),
    description: String(raw['description'] ?? "").slice(0, 2000),
    highlights,
    images,
    source,
  };
}

async function assertStaff(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();
  if (!data) throw new Error("Only store staff can import products");
}

/** Scrapes a product page (Meesho, Amazon, Flipkart…) into an editable draft. */
export const importProductFromUrl = createServerFn({ method: "POST" })
  .inputValidator((input: { url: string }) => {
    const url = input.url.trim();
    if (!/^https?:\/\/\S+$/i.test(url)) throw new Error("Paste a full product link starting with https://");
    return { url: url.slice(0, 500) };
  })
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }): Promise<ProductDraft> => {
    await assertStaff(context.userId);

    const lovableKey = process.env['LOVABLE_API_KEY'];
    const firecrawlKey = process.env['FIRECRAWL_API_KEY'];
    if (!lovableKey || !firecrawlKey) throw new Error("Product import is not configured yet");

    const response = await fetch("https://connector-gateway.lovable.dev/firecrawl/v2/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": firecrawlKey,
      },
      body: JSON.stringify({
        url: data.url,
        onlyMainContent: false,
        waitFor: 3000,
        location: { country: "IN", languages: ["en-IN"] },
        formats: [
          {
            type: "json",
            schema: DRAFT_SCHEMA,
            prompt:
              "Extract the product listing: title, current selling price in rupees, original MRP in rupees, a short description, key feature bullet points and the absolute URLs of the product photos.",
          },
        ],
      }),
    });

    const body = await response.text();
    if (!response.ok) {
      console.error(`[import] scrape failed [${response.status}]: ${body}`);
      if (/SCRAPE_ALL_ENGINES_FAILED|403|blocked/i.test(body)) {
        throw new Error(
          "This shop blocks automated readers, so the link could not be opened. Open the product in your browser, copy the page text and use “Paste product details” instead.",
        );
      }
      throw new Error(`Could not read that link (${response.status})`);
    }

    const parsed = JSON.parse(body) as { json?: Record<string, unknown>; data?: { json?: Record<string, unknown> } };
    const json = parsed.json ?? parsed.data?.json;
    if (!json || !json['title']) throw new Error("No product details were found on that page");
    return normalise(json, "link");
  });

/** Turns pasted product text (copied from any listing) into an editable draft. */
export const importProductFromText = createServerFn({ method: "POST" })
  .inputValidator((input: { text: string }) => {
    const text = input.text.trim();
    if (text.length < 20) throw new Error("Paste a bit more of the product details");
    return { text: text.slice(0, 12000) };
  })
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }): Promise<ProductDraft> => {
    await assertStaff(context.userId);

    const lovableKey = process.env['LOVABLE_API_KEY'];
    if (!lovableKey) throw new Error("Product import is not configured yet");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${lovableKey}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content:
              "You convert pasted online-shop product text into structured data. Prices are Indian rupees, integers only. Never invent images.",
          },
          { role: "user", content: data.text },
        ],
        tools: [
          {
            type: "function",
            function: { name: "save_product", description: "Save the product draft", parameters: DRAFT_SCHEMA },
          },
        ],
        tool_choice: { type: "function", function: { name: "save_product" } },
      }),
    });

    const body = await response.text();
    if (!response.ok) {
      console.error(`[import] ai parse failed [${response.status}]: ${body}`);
      if (response.status === 429) throw new Error("Too many imports right now — try again in a minute");
      if (response.status === 402) throw new Error("AI credits are exhausted — top up to keep importing");
      throw new Error(`Could not read those details (${response.status})`);
    }

    const parsed = JSON.parse(body) as {
      choices?: { message?: { tool_calls?: { function?: { arguments?: string } }[] } }[];
    };
    const args = parsed.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("Could not read those details");
    return normalise(JSON.parse(args) as Record<string, unknown>, "text");
  });
