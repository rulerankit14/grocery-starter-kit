import { createFileRoute, Link } from "@tanstack/react-router";
import { Star, Truck, RotateCcw, BadgeIndianRupee, Zap, ShoppingCart } from "lucide-react";
import { StoreHeader } from "@/components/store/StoreHeader";
import { BottomNav } from "@/components/store/BottomNav";
import { getProduct, discountPercent, products } from "@/lib/products";
import { ProductCard } from "@/components/store/ProductCard";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [
      { title: "Product Details — Arman Groceries" },
      {
        name: "description",
        content:
          "Full product details, highlights, pricing and customer reviews for grocery combo packs at Arman Groceries.",
      },
      { property: "og:title", content: "Product Details — Arman Groceries" },
      {
        property: "og:description",
        content: "Grocery combo packs with real customer ratings and reviews.",
      },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const product = getProduct(id);

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col">
        <StoreHeader back showSearch={false} />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <h1 className="font-display text-xl font-bold">Product not found</h1>
          <Link to="/" className="rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  const off = discountPercent(product.price, product.mrp);
  const related = products.filter((p) => p.id !== product.id).slice(0, 4);
  const buckets = [5, 4, 3, 2, 1].map((s) => ({
    stars: s,
    count: product.reviews.filter((r) => r.stars === s).length,
  }));
  const maxBucket = Math.max(1, ...buckets.map((b) => b.count));

  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader back showSearch={false} cartCount={1} />

      <main className="mx-auto w-full max-w-3xl flex-1 pb-24">
        <div className="bg-card">
          <img
            src={product.image}
            alt={product.title}
            width={800}
            height={800}
            className="aspect-square w-full object-cover"
          />
          <p className="px-4 pt-2 text-xs text-muted-foreground">1 / 4 · Arman Groceries</p>
        </div>

        <section className="mt-2 bg-card px-4 py-4">
          <h1 className="font-display text-lg font-bold leading-snug">{product.title}</h1>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-2xl font-extrabold">₹{product.price}.00</span>
            <span className="text-sm text-muted-foreground line-through">
              ₹{product.mrp.toLocaleString("en-IN")}
            </span>
            <span className="text-sm font-bold text-success">{off}% off</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="flex items-center gap-1 rounded bg-success px-2 py-0.5 text-xs font-bold text-success-foreground">
              {product.rating}
              <Star className="size-3 fill-current" />
            </span>
            <span className="text-xs text-muted-foreground">
              ({product.ratingCount.toLocaleString("en-IN")} Ratings)
            </span>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg border border-accent p-3 text-center">
            <Trust icon={RotateCcw} label="7 Days Easy Return" />
            <Trust icon={Truck} label="Cash on Delivery" />
            <Trust icon={BadgeIndianRupee} label="Lowest Prices" />
          </div>
        </section>

        <section className="mt-2 bg-card px-4 py-4">
          <h2 className="font-display text-base font-bold">Product Description</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
          <h3 className="mt-4 text-sm font-bold">Key Features</h3>
          <ul className="mt-2 space-y-1.5">
            {product.highlights.map((h) => (
              <li key={h} className="flex gap-2 text-sm text-muted-foreground">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                {h}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-2 bg-card px-4 py-4">
          <h2 className="font-display text-base font-bold">Ratings &amp; Reviews</h2>
          <div className="mt-3 flex gap-5">
            <div className="text-center">
              <div className="flex items-center gap-1 font-display text-3xl font-extrabold">
                {product.rating}
                <Star className="size-5 fill-success text-success" />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                {product.ratingCount.toLocaleString("en-IN")} Ratings
              </p>
            </div>
            <div className="flex-1 space-y-1">
              {buckets.map((b) => (
                <div key={b.stars} className="flex items-center gap-2">
                  <span className="w-3 text-[11px] text-muted-foreground">{b.stars}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-success"
                      style={{ width: `${(b.count / maxBucket) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <ul className="mt-4 divide-y divide-border">
            {product.reviews.map((r) => (
              <li key={r.name} className="py-4">
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-full bg-accent text-xs font-bold text-accent-foreground">
                    {r.initials}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{r.name}</p>
                    <p className="text-[11px] text-muted-foreground">Verified Purchase</p>
                  </div>
                  <span className="ml-auto text-[11px] text-muted-foreground">{r.date}</span>
                </div>
                <div className="mt-2 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3.5 ${
                        i < r.stars ? "fill-deal text-deal" : "text-muted-foreground/40"
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
                <p className="mt-2 text-[11px] text-muted-foreground">Helpful · {r.likes}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-2 bg-card px-4 py-4">
          <h2 className="font-display text-base font-bold">Similar Products</h2>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      </main>

      <div className="sticky bottom-0 z-40 grid grid-cols-2 gap-3 border-t border-border bg-card px-4 py-3">
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-md border border-primary py-3 text-sm font-bold text-primary"
        >
          <ShoppingCart className="size-4" /> Add to Cart
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-md bg-primary py-3 text-sm font-bold text-primary-foreground"
        >
          <Zap className="size-4" /> Buy Now
        </button>
      </div>
    </div>
  );
}

function Trust({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <Icon className="size-5 text-primary" />
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}
