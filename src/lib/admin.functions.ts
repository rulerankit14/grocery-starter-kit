import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type StaffMember = {
  userId: string;
  email: string;
  fullName: string | null;
  role: "owner" | "admin";
  loginCode: string;
};

/** Claims ownership of the store for the signed-in user when no owner exists yet. */
export const claimOwnership = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: owners } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "owner")
      .limit(1);

    if (owners && owners.length > 0) return { claimed: false };

    const { data: user } = await supabaseAdmin.auth.admin.getUserById(context.userId);
    await supabaseAdmin
      .from("profiles")
      .upsert({ id: context.userId, email: user?.user?.email ?? null }, { onConflict: "id" });
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "owner" });
    if (error) throw new Error(error.message);
    return { claimed: true };
  });

async function assertOwner(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "owner")
    .maybeSingle();
  if (!data) throw new Error("Only the store owner can manage admins");
  return supabaseAdmin;
}

export const listStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<StaffMember[]> => {
    const supabaseAdmin = await assertOwner(context.userId);
    const { data: roles, error } = await supabaseAdmin
      .from("user_roles")
      .select("user_id, role, login_code")
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);

    const ids = (roles ?? []).map((r) => r.user_id as string);
    const { data: profiles } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name")
      .in("id", ids.length ? ids : ["00000000-0000-0000-0000-000000000000"]);

    const byId = new Map((profiles ?? []).map((p) => [p.id as string, p]));
    return (roles ?? []).map((r) => {
      const profile = byId.get(r.user_id as string);
      return {
        userId: r.user_id as string,
        email: (profile?.email as string) ?? "—",
        fullName: (profile?.full_name as string | null) ?? null,
        role: r.role as "owner" | "admin",
        loginCode: (r.login_code as string) ?? "",
      };
    });
  });

export const addAdmin = createServerFn({ method: "POST" })
  .inputValidator((input: { email: string; password: string; fullName: string }) => {
    const email = input.email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Enter a valid email address");
    if (input.password.length < 8) throw new Error("Password must be at least 8 characters");
    return { email, password: input.password, fullName: input.fullName.trim().slice(0, 80) };
  })
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const supabaseAdmin = await assertOwner(context.userId);

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (error || !created?.user) throw new Error(error?.message ?? "Could not create the admin");

    await supabaseAdmin
      .from("profiles")
      .upsert(
        { id: created.user.id, email: data.email, full_name: data.fullName || null },
        { onConflict: "id" },
      );
    const { error: roleError } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: created.user.id, role: "admin" });
    if (roleError) throw new Error(roleError.message);

    return { userId: created.user.id };
  });

export const removeAdmin = createServerFn({ method: "POST" })
  .inputValidator((input: { userId: string }) => input)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const supabaseAdmin = await assertOwner(context.userId);
    if (data.userId === context.userId) throw new Error("You cannot remove yourself");

    const { data: target } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", data.userId)
      .maybeSingle();
    if (target?.role === "owner") throw new Error("The owner account cannot be removed");

    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    await supabaseAdmin.from("profiles").delete().eq("id", data.userId);
    await supabaseAdmin.auth.admin.deleteUser(data.userId);
    return { ok: true };
  });

/** Confirms the secret link code in the URL belongs to the signed-in staff member. */
export const verifyLoginCode = createServerFn({ method: "POST" })
  .inputValidator((input: { code: string }) => ({ code: input.code.trim().toLowerCase().slice(0, 24) }))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }): Promise<{ ok: boolean }> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("user_roles")
      .select("login_code")
      .eq("user_id", context.userId)
      .maybeSingle();
    return { ok: !!row && (row.login_code as string) === data.code };
  });
