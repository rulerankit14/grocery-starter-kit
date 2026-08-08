import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Role = "owner" | "admin";

export function useSessionUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { user, loading };
}

export function useMyRole(userId: string | undefined) {
  return useQuery({
    queryKey: ["my-role", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<Role | null> => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return (data?.role as Role) ?? null;
    },
  });
}
