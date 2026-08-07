import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <span
        aria-hidden
        className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary font-display text-lg font-extrabold text-primary-foreground"
      >
        a
      </span>
      <span className="font-display text-2xl font-extrabold lowercase tracking-tight text-primary">
        arman
      </span>
    </Link>
  );
}
