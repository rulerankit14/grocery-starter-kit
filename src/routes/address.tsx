import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { MapPin, ShieldCheck } from "lucide-react";
import { StoreHeader } from "@/components/store/StoreHeader";
import { CheckoutSteps } from "@/components/store/CheckoutSteps";
import { useCart, type Address } from "@/lib/cart";

export const Route = createFileRoute("/address")({
  head: () => ({
    meta: [
      { title: "Delivery Address — Arman Groceries" },
      { name: "description", content: "Enter your delivery address to complete your grocery order." },
      { property: "og:title", content: "Delivery Address — Arman Groceries" },
      { property: "og:description", content: "Enter your delivery address for your grocery order." },
    ],
  }),
  component: AddressPage,
});

const fields: { name: keyof Address; label: string; half?: boolean; type?: string }[] = [
  { name: "fullName", label: "Full Name" },
  { name: "mobile", label: "Mobile number", type: "tel" },
  { name: "pincode", label: "Pincode", type: "tel" },
  { name: "city", label: "City", half: true },
  { name: "state", label: "State", half: true },
  { name: "house", label: "House No., Building Name" },
  { name: "road", label: "Road name, Area, Colony" },
];

const empty: Address = {
  fullName: "",
  mobile: "",
  pincode: "",
  city: "",
  state: "",
  house: "",
  road: "",
};

function AddressPage() {
  const cart = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState<Address>(cart.address ?? empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Address, string>>>({});

  function validate(values: Address) {
    const next: Partial<Record<keyof Address, string>> = {};
    if (values.fullName.trim().length < 3) next.fullName = "Enter your full name";
    if (!/^[6-9]\d{9}$/.test(values.mobile.trim())) next.mobile = "Enter a valid 10-digit mobile number";
    if (!/^\d{6}$/.test(values.pincode.trim())) next.pincode = "Enter a valid 6-digit pincode";
    if (!values.city.trim()) next.city = "Enter your city";
    if (!values.state.trim()) next.state = "Enter your state";
    if (!values.house.trim()) next.house = "Enter house no. / building";
    if (!values.road.trim()) next.road = "Enter road, area or colony";
    return next;
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = validate(form);
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    cart.setAddress(form);
    navigate({ to: "/payment" });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader back showSearch={false} />
      <CheckoutSteps current={2} />

      <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
        <section className="mt-2 flex items-center gap-2 bg-card px-4 py-4">
          <MapPin className="size-6 text-primary" />
          <h1 className="font-display text-lg font-bold">Address</h1>
        </section>

        <section className="mt-2 grid grid-cols-2 gap-4 bg-card px-4 py-5">
          {fields.map((f) => (
            <div key={f.name} className={f.half ? "col-span-1" : "col-span-2"}>
              <label htmlFor={f.name} className="mb-1 block text-xs text-muted-foreground">
                {f.label}
              </label>
              <input
                id={f.name}
                name={f.name}
                type={f.type ?? "text"}
                value={form[f.name]}
                onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                aria-invalid={Boolean(errors[f.name])}
                className={`w-full rounded-md border bg-background px-3 py-3 text-sm outline-none focus:border-primary ${
                  errors[f.name] ? "border-destructive" : "border-border"
                }`}
              />
              {errors[f.name] && (
                <p className="mt-1 text-[11px] text-destructive">{errors[f.name]}</p>
              )}
            </div>
          ))}
        </section>

        <section className="mt-2 flex items-center justify-center gap-2 bg-card px-4 py-4 text-[11px] text-muted-foreground">
          <ShieldCheck className="size-4 text-success" />
          Secured payments · Verified merchant · Cash on delivery available
        </section>

        <div className="mt-auto sticky bottom-0 border-t border-border bg-card px-4 py-3">
          <button
            type="submit"
            className="w-full rounded-md bg-primary py-3.5 text-sm font-bold text-primary-foreground"
          >
            Save Address and Continue
          </button>
        </div>
      </form>
    </div>
  );
}
