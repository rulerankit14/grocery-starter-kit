import { Link, useNavigate } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { discountPercent, type Product } from "@/lib/products";
import { useCart } from "@/lib/cart";

export function ProductCard({ product }: { product: Product }) {
  const cart = useCart();
  const navigate = useNavigate();

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
      <Link
        to="/product/$id"
        params={{ id: product.id }}
        className="block aspect-square overflow-hidden bg-muted"
      >
        <img
          src={product.image}
          alt={product.title}
          width={800}
          height={800}
          loading="lazy"
          className="size-full object-cover"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-2.5">
        <Link
          to="/product/$id"
          params={{ id: product.id }}
          className="line-clamp-2 text-xs leading-snug text-muted-foreground"
        >
          {product.title}
        </Link>
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-lg font-extrabold">₹{product.price}</span>
          <span className="text-xs text-muted-foreground line-through">
            ₹{product.mrp.toLocaleString("en-IN")}
          </span>
          <span className="text-xs font-semibold text-success">
            {discountPercent(product.price, product.mrp)}% off
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-0.5 rounded bg-success px-1.5 py-0.5 text-[11px] font-bold text-success-foreground">
            {product.rating}
            <Star className="size-2.5 fill-current" />
          </span>
          <span className="text-[11px] text-muted-foreground">
            {product.ratingCount.toLocaleString("en-IN")} Reviews
          </span>
        </div>
        {product.freeDelivery && (
          <span className="text-[11px] font-medium text-success">Free Delivery</span>
        )}
        <button
          type="button"
          onClick={() => {
            cart.add(product.id);
            navigate({ to: "/cart" });
          }}
          className="mt-auto block rounded-md bg-primary py-2 text-center text-xs font-bold text-primary-foreground"
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}
