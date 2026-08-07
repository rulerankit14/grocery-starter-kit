import { Home, LayoutGrid, Package, MessageCircle, User } from "lucide-react";

const items = [
  { label: "Home", icon: Home, active: true },
  { label: "Categories", icon: LayoutGrid, active: false },
  { label: "My Orders", icon: Package, active: false },
  { label: "Help", icon: MessageCircle, active: false },
  { label: "Account", icon: User, active: false },
];

export function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-40 border-t border-border bg-card">
      <ul className="mx-auto flex max-w-3xl">
        {items.map((item) => (
          <li key={item.label} className="flex-1">
            <button
              type="button"
              className={`flex w-full flex-col items-center gap-1 py-2 text-[11px] ${
                item.active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="size-5" />
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
