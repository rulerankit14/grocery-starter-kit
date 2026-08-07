import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { StoreHeader } from "@/components/store/StoreHeader";
import { CheckoutSteps } from "@/components/store/CheckoutSteps";
import { useCart } from "@/lib/cart";

type SummarySearch = { method?: "upi" | "card" | "cod" };

export const Route = createFileRoute("/summary")({
  validateSearch: (search: Record<string, unknown>): SummarySearch => ({
    method:
      search.method === "upi" || search.method === "card" || search.method === "cod"
        ? search.method
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Order Summary — Arman Groceries" },
      { name: "description", content: "Your grocery order summary and delivery details." },
      { property: "og:title", content: "Order Summary — Arman Groceries" },
      { property: "og:description", content: "Your grocery order summary and delivery details." },
    ],
  }),
  component: SummaryPage,
});

const methodLabel: Record<string, string> = {
  upi: "UPI",
  card: "Credit / Debit Card",
  cod: "Cash on Delivery",
};

function SummaryPage() {
  const { method } = Route.useSearch();
  const cart = useCart();
  const snapshot = useRef<{
    items: { title: string; image: string; qty: number; price: number }[];
    total: number;
    shipping: number;
    subtotal: number;
    address: typeof cart.address;
  } | null>(null);
  const [orderId] = useState(() => `ARM${Math.floor(100000 + Math.random() * 899999)}`);

  if (snapshot.current === null && cart.items.length > 0) {
    snapshot.current = {
      items: cart.items.map((i) => ({
        title: i.product.title,
        image: i.product.image,
        qty: i.qty,
        price: i.product.price,
      })),
      subtotal: cart.subtotal,
      shipping: cart.shipping,
      total: cart.total,
      address: cart.address,
    };
  }

  const clear = cart.clear;
  useEffect(() => {
    if (snapshot.current) clear();
  }, [clear]);

  const order = snapshot.current;

  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader back showSearch={false} cartCount={0} />
      <CheckoutSteps current={4} />

      <main className="mx-auto w-full max-w-3xl flex-1 pb-8">
        {!order ? (
          <section className="mt-2 flex flex-col items-center gap-3 bg-card px-4 py-12 text-center">
            <h1 className="font-display text-lg font-bold">No order to show</h1>
            <p className="text-sm text-muted-foreground">Add items to your cart to place an order.</p>
            <Link to="/" className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
              Start Shopping
            </Link>
          </section>
        ) : (
          <>
            <section className="mt-2 flex flex-col items-center gap-2 bg-card px-4 py-8 text-center">
              <CheckCircle2 className="size-12 text-success" />
              <h1 className="font-display text-xl font-extrabold">Order Placed</h1>
              <p className="text-sm text-muted-foreground">
                Order ID <span className="font-bold text-foreground">{orderId}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Paid via {methodLabel[method ?? "cod"]}
              </p>
            </section>

            <section className="mt-2 bg-card px-4 py-4">
              <h2 className="font-display text-base font-bold">Items</h2>
              <ul className="mt-3 divide-y divide-border">
                {order.items.map((i) => (
                  <li key={i.title} className="flex gap-3 py-3">
                    <img
                      src={i.image}
                      alt={i.title}
                      width={800}
                      height={800}
                      loading="lazy"
                      className="size-16 shrink-0 rounded object-cover"
                    />
                    <div className="flex-1">
                      <p className="line-clamp-2 text-sm">{i.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Qty: {i.qty}</p>
                    </div>
                    <span className="text-sm font-bold">₹{i.price * i.qty}.00</span>
                  </li>
                ))}
              </ul>
            </section>

            {order.address && (
              <section className="mt-2 bg-card px-4 py-4">
                <h2 className="font-display text-base font-bold">Delivery Address</h2>
                <p className="mt-2 text-sm font-semibold">{order.address.fullName}</p>
                <p className="text-sm text-muted-foreground">
                  {order.address.house}, {order.address.road}
                  <br />
                  {order.address.city}, {order.address.state} - {order.address.pincode}
                  <br />
                  Mobile: {order.address.mobile}
                </p>
              </section>
            )}

            <section className="mt-2 space-y-2 bg-card px-4 py-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Product Price:</span>
                <span>₹{order.subtotal}.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping:</span>
                <span className="font-bold text-success">
                  {order.shipping === 0 ? "FREE" : `₹${order.shipping}.00`}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-bold">
                <span>Order Total:</span>
                <span>₹{order.total}.00</span>
              </div>
            </section>

            <div className="px-4 py-6">
              <Link
                to="/"
                className="block rounded-md bg-primary py-3 text-center text-sm font-bold text-primary-foreground"
              >
                Continue Shopping
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
