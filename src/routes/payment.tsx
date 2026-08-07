import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Banknote, Smartphone, CreditCard } from "lucide-react";
import { StoreHeader } from "@/components/store/StoreHeader";
import { CheckoutSteps } from "@/components/store/CheckoutSteps";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/payment")({
  head: () => ({
    meta: [
      { title: "Select Payment Method — Arman Groceries" },
      { name: "description", content: "Choose UPI, card or cash on delivery to place your grocery order." },
      { property: "og:title", content: "Select Payment Method — Arman Groceries" },
      { property: "og:description", content: "Choose how you'd like to pay for your grocery order." },
    ],
  }),
  component: PaymentPage,
});

type Method = "upi" | "card" | "cod";

const methods: { id: Method; label: string; hint: string; icon: typeof Smartphone }[] = [
  { id: "upi", label: "UPI (GPay / PhonePe / Paytm)", hint: "Pay instantly from any UPI app", icon: Smartphone },
  { id: "card", label: "Credit / Debit Card", hint: "Visa, Mastercard, RuPay", icon: CreditCard },
  { id: "cod", label: "Cash on Delivery", hint: "Pay when your order arrives", icon: Banknote },
];

function PaymentPage() {
  const cart = useCart();
  const navigate = useNavigate();
  const [method, setMethod] = useState<Method>("upi");

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
          <ul className="mt-2 divide-y divide-border">
            {methods.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => setMethod(m.id)}
                  aria-pressed={method === m.id}
                  className="flex w-full items-center gap-3 px-4 py-4 text-left"
                >
                  <span
                    className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${
                      method === m.id ? "border-primary" : "border-border"
                    }`}
                  >
                    {method === m.id && <span className="size-2.5 rounded-full bg-primary" />}
                  </span>
                  <m.icon className="size-5 text-primary" />
                  <span className="flex-1">
                    <span className="block text-sm font-semibold">{m.label}</span>
                    <span className="block text-xs text-muted-foreground">{m.hint}</span>
                  </span>
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
          Online payment is not connected yet. Placing an order here creates a demo order summary.
        </p>
      </main>

      <div className="sticky bottom-0 z-40 flex items-center justify-between gap-4 border-t border-border bg-card px-4 py-3">
        <div>
          <p className="font-display text-lg font-extrabold">₹{cart.total}.00</p>
          <p className="text-[11px] font-bold uppercase text-primary">View price details</p>
        </div>
        <button
          type="button"
          onClick={() => navigate({ to: "/summary", search: { method } })}
          className="rounded-md bg-primary px-8 py-3 text-sm font-bold text-primary-foreground"
        >
          {method === "cod" ? "Place Order" : "Pay Now"}
        </button>
      </div>
    </div>
  );
}
