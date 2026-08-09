import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { StoreHeader } from "@/components/store/StoreHeader";
import { CheckoutSteps } from "@/components/store/CheckoutSteps";
import { useCart } from "@/lib/cart";
import { useQuery } from "@tanstack/react-query";
import { settingsQuery } from "@/lib/products";
import gpayAsset from "@/assets/gpay.jpg.asset.json";
import phonepeAsset from "@/assets/phonepe.webp.asset.json";

export const Route = createFileRoute("/payment")({
  head: () => ({
    meta: [
      { title: "UPI Payment — Arman Groceries" },
      { name: "description", content: "Pay securely with any UPI app such as Google Pay or PhonePe." },
      { property: "og:title", content: "UPI Payment — Arman Groceries" },
      { property: "og:description", content: "Pay securely with any UPI app such as Google Pay or PhonePe." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PaymentPage,
});

type UpiApp = "gpay" | "phonepe";

const apps: { id: UpiApp; label: string; note?: string; logo: string; scheme: string }[] = [
  { id: "gpay", label: "G Pay", logo: gpayAsset.url, scheme: "tez://upi/pay" },
  { id: "phonepe", label: "PhonePe", note: "20% OFF", logo: phonepeAsset.url, scheme: "phonepe://pay" },
];

function PaymentPage() {
  const cart = useCart();
  const [app, setApp] = useState<UpiApp>("gpay");
  const { data: settings } = useQuery(settingsQuery());

  function payNow() {
    const pa = (settings?.upiId ?? "").trim();
    const pn = (settings?.upiName ?? "Arman Groceries").trim();
    if (!pa) return;

    // Unique transaction reference — UPI apps reject/limit payments without one.
    const ref = `ARM${Date.now().toString().slice(-9)}`;
    const enc = (v: string) => encodeURIComponent(v).replace(/%20/g, "%20");
    const query = [
      `pa=${enc(pa)}`,
      `pn=${enc(pn)}`,
      `tr=${enc(ref)}`,
      `tn=${enc(`Arman Order ${ref}`)}`,
      // Amount must be a plain 2-decimal number, otherwise apps treat it as open/invalid.
      `am=${cart.total.toFixed(2)}`,
      `cu=INR`,
    ].join("&");

    // Generic upi:// intent lets Android show the "choose UPI app — Just once / Always" picker.
    window.location.href = `upi://pay?${query}`;
  }


  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader back showSearch={false} />
      <CheckoutSteps current={3} />

      <main className="mx-auto w-full max-w-3xl flex-1">
        <section className="mt-2 flex items-center justify-between bg-card px-4 py-4">
          <h1 className="font-display text-lg font-bold">Select Payment Method</h1>
          <span className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground">
            <ShieldCheck className="size-4 text-primary" />
            100% SAFE
          </span>
        </section>

        <section className="mt-2 bg-card">
          <h2 className="px-4 pt-4 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Pay Online
          </h2>

          <div className="mt-3 flex items-center gap-3 border-t border-border px-4 py-4">
            <span className="rounded bg-success px-2 py-1 text-xs font-extrabold text-primary-foreground">
              UPI
            </span>
            <span className="text-sm font-bold">UPI (GPay/PhonePe/Paytm)</span>
          </div>

          <ul className="divide-y divide-border border-t border-border">
            {apps.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => setApp(a.id)}
                  aria-pressed={app === a.id}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left"
                >
                  <span
                    className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${
                      app === a.id ? "border-primary" : "border-border"
                    }`}
                  >
                    {app === a.id && <span className="size-2.5 rounded-full bg-primary" />}
                  </span>
                  <span className="flex-1 text-sm font-semibold">
                    {a.label}
                    {a.note && <span className="ml-2 font-bold text-success">{a.note}</span>}
                  </span>
                  <img
                    src={a.logo}
                    alt={`${a.label} logo`}
                    width={80}
                    height={80}
                    loading="lazy"
                    className="size-8 rounded object-contain"
                  />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-2 space-y-2 bg-card px-4 py-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Product Price:</span>
            <span>₹{cart.subtotal}.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping:</span>
            <span className="font-bold text-success">
              {cart.shipping === 0 ? "FREE" : `₹${cart.shipping}.00`}
            </span>
          </div>
          <div className="flex justify-between border-t border-border pt-2 font-bold">
            <span>Order Total:</span>
            <span>₹{cart.total}.00</span>
          </div>
        </section>

        <p className="px-4 py-4 text-center text-[11px] text-muted-foreground">
          {settings?.upiId
            ? `You'll be asked to choose your UPI app (Just once / Always) and pay ₹${cart.total} to ${settings.upiId}.`
            : "UPI ID is not configured yet."}
        </p>
      </main>

      <div className="sticky bottom-0 z-40 flex items-center justify-between gap-4 border-t border-border bg-card px-4 py-3">
        <div>
          <p className="font-display text-lg font-extrabold">₹{cart.total}.00</p>
          <p className="text-[11px] font-bold uppercase text-primary">View price details</p>
        </div>
        <button
          type="button"
          onClick={payNow}
          className="rounded-md bg-primary px-8 py-3 text-sm font-bold text-primary-foreground"
        >
          PayNow
        </button>
      </div>
    </div>
  );
}
