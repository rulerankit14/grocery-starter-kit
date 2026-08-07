import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getProduct, type Product } from "./products";

export type CartLine = { id: string; qty: number };

export type Address = {
  fullName: string;
  mobile: string;
  pincode: string;
  city: string;
  state: string;
  house: string;
  road: string;
};

export type DeliveryOption = "standard" | "next-day";

type CartContextValue = {
  lines: CartLine[];
  items: { product: Product; qty: number }[];
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  delivery: DeliveryOption;
  setDelivery: (d: DeliveryOption) => void;
  address: Address | null;
  setAddress: (a: Address) => void;
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "arman-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [delivery, setDelivery] = useState<DeliveryOption>("next-day");
  const [address, setAddress] = useState<Address | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          lines?: CartLine[];
          delivery?: DeliveryOption;
          address?: Address | null;
        };
        if (parsed.lines) setLines(parsed.lines);
        if (parsed.delivery) setDelivery(parsed.delivery);
        if (parsed.address) setAddress(parsed.address);
      }
    } catch {
      /* ignore corrupted storage */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ lines, delivery, address }));
    } catch {
      /* ignore quota errors */
    }
  }, [lines, delivery, address]);

  const value = useMemo<CartContextValue>(() => {
    const items = lines
      .map((l) => {
        const product = getProduct(l.id);
        return product ? { product, qty: l.qty } : null;
      })
      .filter((x): x is { product: Product; qty: number } => x !== null);

    const subtotal = items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
    const shipping = items.length === 0 || delivery === "standard" ? 0 : 49;

    return {
      lines,
      items,
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal,
      shipping,
      total: subtotal + shipping,
      delivery,
      setDelivery,
      address,
      setAddress,
      add: (id, qty = 1) =>
        setLines((prev) => {
          const found = prev.find((l) => l.id === id);
          if (found) return prev.map((l) => (l.id === id ? { ...l, qty: l.qty + qty } : l));
          return [...prev, { id, qty }];
        }),
      setQty: (id, qty) =>
        setLines((prev) =>
          qty <= 0 ? prev.filter((l) => l.id !== id) : prev.map((l) => (l.id === id ? { ...l, qty } : l)),
        ),
      remove: (id) => setLines((prev) => prev.filter((l) => l.id !== id)),
      clear: () => setLines((prev) => (prev.length === 0 ? prev : [])),
    };
  }, [lines, delivery, address]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
