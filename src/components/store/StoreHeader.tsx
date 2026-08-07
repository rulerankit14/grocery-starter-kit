import { Link } from "@tanstack/react-router";
import { Heart, Menu, Search, ShoppingCart, ChevronLeft } from "lucide-react";
import { Logo } from "./Logo";
import { useCart } from "@/lib/cart";

export function StoreHeader({
  back = false,
  showSearch = true,
  cartCount,
}: {
  back?: boolean;
  showSearch?: boolean;
  cartCount?: number;
}) {
  const cart = useCart();
  const count = cartCount ?? cart.count;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        {back ? (
          <Link to="/" aria-label="Go back" className="-ml-1 text-muted-foreground">
            <ChevronLeft className="size-6" />
          </Link>
        ) : (
          <button type="button" aria-label="Open menu" className="-ml-1 text-foreground">
            <Menu className="size-6" />
          </button>
        )}
        <Logo />
        <div className="ml-auto flex items-center gap-4">
          <button type="button" aria-label="Wishlist" className="text-destructive">
            <Heart className="size-6 fill-current" />
          </button>
          <Link to="/cart" aria-label="Cart" className="relative text-primary">
            <ShoppingCart className="size-6" />
            <span className="absolute -right-2 -top-2 grid size-5 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
              {count}
            </span>
          </Link>
        </div>
      </div>
      {showSearch && (
        <div className="mx-auto max-w-3xl px-4 pb-3">
          <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2.5">
            <Search className="size-5 text-muted-foreground" />
            <input
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Search for Atta, Rice, Dry Fruits, etc."
              aria-label="Search products"
            />
          </div>
        </div>
      )}
    </header>
  );
}
