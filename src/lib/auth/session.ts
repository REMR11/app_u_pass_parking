import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { createClient, hasSupabaseCredentials } from "@/utils/supabase/server";

export function getUserDisplayName(user: User): string {
  const meta = user.user_metadata as Record<string, unknown> | undefined;
  if (typeof meta?.full_name === "string" && meta.full_name.trim()) {
    return meta.full_name.trim();
  }
  if (typeof meta?.name === "string" && meta.name.trim()) {
    return meta.name.trim();
  }
  const email = user.email;
  if (email) return email.split("@")[0] ?? "Usuario";
  return "Usuario";
}

/** Usuario autenticado en RSC / Server Actions (JWT validado con Supabase). */
export async function getSessionUser(): Promise<User | null> {
  if (!hasSupabaseCredentials()) {
    return null;
  }

  const supabase = createClient(await cookies());
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}
