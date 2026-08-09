import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <img
  src="/logo.png"
  alt="Meesho"
  className="size-8 shrink-0 rounded-lg object-cover"
/>

<span className="font-display text-2xl font-extrabold lowercase tracking-tight text-primary">
  meesho
</span>
    </Link>
  );
}
