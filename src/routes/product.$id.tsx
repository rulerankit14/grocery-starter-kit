import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Star, Truck, RotateCcw, BadgeIndianRupee, Zap, ShoppingCart } from "lucide-react";
import { StoreHeader } from "@/components/store/StoreHeader";
import { discountPercent, productImagesQuery, productQuery, productsQuery, reviewsQuery } from "@/lib/products";
import { ProductCard } from "@/components/store/ProductCard";
import { ImageCarousel } from "@/components/store/ImageCarousel";
import { useCart } from "@/lib/cart";

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
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const cart = useCart();
  const navigate = useNavigate();
  const { data: product, isLoading } = useQuery(productQuery(id));
  const { data: reviews = [] } = useQuery(reviewsQuery(id));
  const { data: all = [] } = useQuery(productsQuery());

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <StoreHeader back showSearch={false} />
        <div className="aspect-square w-full animate-pulse bg-muted" />
      </div>
    );
  }

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
  const related = all.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader back showSearch={false} />

      <main className="mx-auto w-full max-w-3xl flex-1 pb-24">
        <div className="bg-card">
          <ImageCarousel
            images={gallery.length ? gallery.map((g) => g.imageUrl) : [product.image]}
            alt={product.title}
          />
          <p className="px-4 pt-2 text-xs text-muted-foreground">Arman Groceries</p>
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
          {product.highlights.length > 0 && (
            <>
              <h3 className="mt-4 text-sm font-bold">Key Features</h3>
              <ul className="mt-2 space-y-1.5">
                {product.highlights.map((h) => (
                  <li key={h} className="flex gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                    {h}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>

        {reviews.length > 0 && (
          <section className="mt-2 bg-card px-4 py-4">
            <h2 className="font-display text-base font-bold">Ratings &amp; Reviews</h2>
            <div className="mt-3 flex items-center gap-3">
              <span className="flex items-center gap-1 font-display text-3xl font-extrabold">
                {product.rating}
                <Star className="size-5 fill-success text-success" />
              </span>
              <p className="text-[11px] text-muted-foreground">
                {product.ratingCount.toLocaleString("en-IN")} Ratings
              </p>
            </div>
            <ul className="mt-4 space-y-4">
              {reviews.map((r) => (
                <li key={r.id} className="overflow-hidden rounded-lg border border-border">
                  <img
                    src={r.imageUrl}
                    alt={r.caption || "Customer review"}
                    loading="lazy"
                    className="w-full object-contain"
                  />
                  {r.caption && (
                    <p className="px-3 py-2 text-xs text-muted-foreground">{r.caption}</p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-2 bg-card px-4 py-4">
            <h2 className="font-display text-base font-bold">Similar Products</h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>

      <div className="sticky bottom-0 z-40 grid grid-cols-2 gap-3 border-t border-border bg-card px-4 py-3">
        <button
          type="button"
          onClick={() => {
            cart.add(product.id);
            navigate({ to: "/cart" });
          }}
          className="flex items-center justify-center gap-2 rounded-md border border-primary py-3 text-sm font-bold text-primary"
        >
          <ShoppingCart className="size-4" /> Add to Cart
        </button>
        <button
          type="button"
          onClick={() => {
            cart.add(product.id);
            navigate({ to: "/address" });
          }}
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
