const steps = ["Cart", "Address", "Payment", "Summary"] as const;

export function CheckoutSteps({ current }: { current: 1 | 2 | 3 | 4 }) {
  return (
    <ol className="flex items-center bg-card px-4 py-4">
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n <= current;
        return (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <span
                className={`grid size-8 place-items-center rounded-full border-2 text-sm font-bold ${
                  done
                    ? "border-primary text-primary"
                    : "border-border text-muted-foreground"
                }`}
              >
                {n}
              </span>
              <span
                className={`text-[11px] font-semibold ${
                  done ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </div>
            {n < steps.length && (
              <span
                className={`-mt-5 h-0.5 flex-1 ${n < current ? "bg-primary" : "bg-border"}`}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
