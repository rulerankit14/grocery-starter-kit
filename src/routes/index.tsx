import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { RotateCcw, Truck, BadgeIndianRupee, Zap } from "lucide-react";
import { StoreHeader } from "@/components/store/StoreHeader";
import { BottomNav } from "@/components/store/BottomNav";
import { ProductCard } from "@/components/store/ProductCard";
import { products } from "@/lib/products";
import banner from "@/assets/banner-grains.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Arman Groceries — Daily Essentials at Lowest Prices" },
      {
        name: "description",
        content:
          "Shop atta, rice, oil, dry fruits, masalas and household essentials at Arman Groceries. Cash on delivery, 7 days easy return and free delivery on combo packs.",
      },
      { property: "og:title", content: "Arman Groceries — Daily Essentials at Lowest Prices" },
      {
        property: "og:description",
        content:
          "Grocery combo packs, dry fruits and household essentials with cash on delivery and free shipping.",
      },
    ],
  }),
  component: Index,
});

function useCountdown(seconds: number) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    const t = setInterval(() => setLeft((v) => (v > 0 ? v - 1 : seconds)), 1000);
    return () => clearInterval(t);
  }, [seconds]);
  const h = String(Math.floor(left / 3600)).padStart(2, "0");
  const m = String(Math.floor((left % 3600) / 60)).padStart(2, "0");
  const s = String(left % 60).padStart(2, "0");
  return `${h}h : ${m}m : ${s}s`;
}

function Index() {
  const timer = useCountdown(60 * 47 + 12);
  const grid = [...products, ...products];

  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader />

      <main className="mx-auto w-full max-w-3xl flex-1">
        <div className="overflow-hidden bg-deal py-1.5">
          <div className="marquee-track text-xs font-extrabold uppercase tracking-wide text-deal-foreground">
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={i} className="px-4">
                Biggest Brands Bash · Sale is Live · Sale is Live · Sale is Live ·
              </span>
            ))}
          </div>
        </div>

        <section className="relative bg-card">
          <img
            src={banner}
            alt="Foodgrains, oils and ghee sale banner"
            width={1200}
            height={600}
            className="h-44 w-full object-cover sm:h-56"
          />
          <div className="absolute inset-y-0 left-0 flex w-1/2 flex-col justify-center gap-2 px-4">
            <h2 className="font-display text-lg font-extrabold leading-tight sm:text-2xl">
              Foodgrains, Oils &amp; Ghee
            </h2>
            <span className="w-fit rounded bg-success px-2 py-1 text-xs font-bold text-success-foreground sm:text-sm">
              UP TO 60% OFF
            </span>
          </div>
        </section>

        <div className="overflow-hidden bg-secondary py-1.5">
          <div className="marquee-track text-xs font-bold text-secondary-foreground">
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={i} className="px-6">
                Buy 2 Get 1 Free (Add 3 items to cart) · Buy 2 Get 1 Free (Add 3 items to cart) ·
              </span>
            ))}
          </div>
        </div>

        <section className="bg-surface px-3 py-3">
          <div className="grid grid-cols-3 divide-x divide-border rounded-lg border border-accent bg-card py-3 text-center">
            <Trust icon={RotateCcw} label="7 Days Easy Return" />
            <Trust icon={Truck} label="Cash on Delivery" />
            <Trust icon={BadgeIndianRupee} label="Lowest Prices" />
          </div>
        </section>

        <section className="flex items-center gap-3 bg-card px-4 py-3">
          <h2 className="flex items-center gap-1.5 font-display text-base font-extrabold">
            Arman Daily Deals
            <Zap className="size-4 fill-deal text-deal" />
          </h2>
          <span className="ml-auto rounded-md bg-accent px-3 py-1.5 font-display text-sm font-bold tabular-nums text-primary">
            {timer}
          </span>
        </section>

        <section className="px-3 pb-6 pt-4">
          <h2 className="mb-3 font-display text-lg font-extrabold">Products For You</h2>
          <div className="grid grid-cols-2 gap-3">
            {grid.map((p, i) => (
              <ProductCard key={`${p.id}-${i}`} product={p} />
            ))}
          </div>
        </section>

        <footer className="bg-card px-4 py-8 text-center">
          <p className="font-display text-xl font-extrabold lowercase text-primary">arman groceries</p>
          <p className="mt-1 text-xs text-muted-foreground">
            India&apos;s trusted store for daily essentials
          </p>
          <p className="mt-4 text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} Arman Groceries. All rights reserved.
          </p>
        </footer>
      </main>

      <BottomNav />
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
    <div className="flex flex-col items-center gap-1 px-1">
      <Icon className="size-5 text-primary" />
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}
