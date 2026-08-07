import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingCart } from "lucide-react";
import { StoreHeader } from "@/components/store/StoreHeader";
import { CheckoutSteps } from "@/components/store/CheckoutSteps";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Arman Groceries" },
      { name: "description", content: "Review the grocery items in your cart and choose a delivery option." },
      { property: "og:title", content: "Your Cart — Arman Groceries" },
      { property: "og:description", content: "Review your grocery order before checkout." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const cart = useCart();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader back showSearch={false} />
      <CheckoutSteps current={1} />

      <main className="mx-auto w-full max-w-3xl flex-1 pb-4">
        <section className="mt-2 bg-card px-4 py-4">
          <h1 className="font-display text-lg font-bold">Cart</h1>

          {cart.items.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <ShoppingCart className="size-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Your cart is empty.</p>
              <Link
                to="/"
                className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"
              >
                Continue Shopping
              </Link>
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-border">
              {cart.items.map(({ product, qty }) => (
                <li key={product.id} className="flex gap-3 py-4">
                  <img
                    src={product.image}
                    alt={product.title}
                    width={800}
                    height={800}
                    loading="lazy"
                    className="size-20 shrink-0 rounded object-cover"
                  />
                  <div className="flex-1">
                    <Link
                      to="/product/$id"
                      params={{ id: product.id }}
                      className="line-clamp-3 text-sm font-semibold text-primary"
                    >
                      {product.title}
                    </Link>
                    <p className="mt-1 font-display text-base font-extrabold">
                      ₹{product.price}.00
                    </p>
                    <div className="mt-2 flex w-fit items-center rounded border border-border">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => cart.setQty(product.id, qty - 1)}
                        className="px-3 py-1.5 text-muted-foreground"
                      >
                        <Minus className="size-4" />
                      </button>
                      <span className="min-w-8 text-center text-sm font-bold">{qty}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => cart.setQty(product.id, qty + 1)}
                        className="px-3 py-1.5 text-muted-foreground"
                      >
                        <Plus className="size-4" />
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    aria-label="Remove item"
                    onClick={() => cart.remove(product.id)}
                    className="self-start text-muted-foreground"
                  >
                    <Trash2 className="size-5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {cart.items.length > 0 && (
          <>
            <section className="mt-2 bg-card px-4 py-4">
              <h2 className="font-display text-base font-bold">Delivery Options</h2>
              <div className="mt-3 space-y-3">
                <DeliveryRow
                  selected={cart.delivery === "standard"}
                  onSelect={() => cart.setDelivery("standard")}
                  title="Standard Delivery"
                  subtitle="Delivery in 4 to 5 days"
                  price="FREE"
                />
                <DeliveryRow
                  selected={cart.delivery === "next-day"}
                  onSelect={() => cart.setDelivery("next-day")}
                  title="Next Day Delivery"
                  subtitle="Fast delivery by tomorrow"
                  price="₹49"
                />
              </div>
            </section>

            <section className="mt-2 space-y-2 bg-card px-4 py-4 text-sm">
              <Row label="Total Product Price:" value={`₹${cart.subtotal}.00`} />
              <Row
                label="Shipping:"
                value={cart.shipping === 0 ? "FREE" : `₹${cart.shipping}.00`}
                valueClass="text-success font-bold"
              />
              <div className="flex justify-between border-t border-border pt-2 font-bold">
                <span>Order Total :</span>
                <span>₹{cart.total}.00</span>
              </div>
            </section>
          </>
        )}
      </main>

      {cart.items.length > 0 && (
        <div className="sticky bottom-0 z-40 flex items-center justify-between gap-4 border-t border-border bg-card px-4 py-3">
          <span className="font-display text-lg font-extrabold">₹{cart.total}.00</span>
          <button
            type="button"
            onClick={() => navigate({ to: "/address" })}
            className="rounded-md bg-primary px-8 py-3 text-sm font-bold text-primary-foreground"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
}

function Row({ label, value, valueClass = "" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={valueClass}>{value}</span>
    </div>
  );
}

function DeliveryRow({
  selected,
  onSelect,
  title,
  subtitle,
  price,
}: {
  selected: boolean;
  onSelect: () => void;
  title: string;
  subtitle: string;
  price: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex w-full items-center gap-3 rounded-lg border p-3 text-left ${
        selected ? "border-primary bg-accent/40" : "border-border"
      }`}
    >
      <span
        className={`grid size-5 shrink-0 place-items-center rounded-full border-2 ${
          selected ? "border-primary" : "border-border"
        }`}
      >
        {selected && <span className="size-2.5 rounded-full bg-primary" />}
      </span>
      <span className="flex-1">
        <span className="block text-sm font-bold">{title}</span>
        <span className="block text-xs text-muted-foreground">{subtitle}</span>
      </span>
      <span className={`text-sm font-bold ${price === "FREE" ? "text-success" : ""}`}>{price}</span>
    </button>
  );
}
