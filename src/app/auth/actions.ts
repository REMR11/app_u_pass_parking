"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { mapAuthError } from "@/lib/auth/map-auth-error";
import { signInSchema, signUpSchema } from "@/lib/auth/schemas";
import { notifyWelcomeIfNeeded } from "@/lib/auth/welcome";
import { createClient, hasSupabaseCredentials } from "@/utils/supabase/server";

export type AuthActionResult =
  | { ok: true; needsEmailConfirmation?: boolean }
  | { ok: false; error: string };

function missingEnvResult(): AuthActionResult {
  return {
    ok: false,
    error: "El servidor no tiene configurado Supabase. Contacta al administrador.",
  };
}

export async function signInWithEmailPassword(
  rawEmail: string,
  rawPassword: string,
): Promise<AuthActionResult> {
  if (!hasSupabaseCredentials()) return missingEnvResult();

  const parsed = signInSchema.safeParse({ email: rawEmail, password: rawPassword });
  if (!parsed.success) {
    const first = parsed.error.flatten().fieldErrors;
    const msg =
      first.email?.[0] ?? first.password?.[0] ?? "Datos de acceso no válidos.";
    return { ok: false, error: msg };
  }

  const supabase = createClient(await cookies());
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { ok: false, error: mapAuthError(error) };
  }

  const email = data.user?.email;
  if (email) {
    const meta = data.user?.user_metadata as Record<string, unknown> | undefined;
    const name =
      (typeof meta?.full_name === "string" ? meta.full_name : undefined) ??
      (typeof meta?.name === "string" ? meta.name : undefined);
    await notifyWelcomeIfNeeded({ email, name: name ?? null, event: "sign_in" });
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

export async function signUpWithEmail(
  fullName: string,
  rawEmail: string,
  password: string,
  confirmPassword: string,
  acceptTerms: boolean,
): Promise<AuthActionResult> {
  if (!hasSupabaseCredentials()) return missingEnvResult();

  const parsed = signUpSchema.safeParse({
    fullName,
    email: rawEmail,
    password,
    confirmPassword,
    acceptTerms,
  });

  if (!parsed.success) {
    const issues = parsed.error.flatten().fieldErrors;
    const msg =
      issues.fullName?.[0] ??
      issues.email?.[0] ??
      issues.password?.[0] ??
      issues.confirmPassword?.[0] ??
      issues.acceptTerms?.[0] ??
      "Revisa los datos del formulario.";
    return { ok: false, error: msg };
  }

  const supabase = createClient(await cookies());
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName.trim(),
      },
    },
  });

  if (error) {
    return { ok: false, error: mapAuthError(error) };
  }

  const email = data.user?.email;
  const session = data.session;

  if (email && session) {
    await notifyWelcomeIfNeeded({
      email,
      name: parsed.data.fullName.trim(),
      event: "sign_up",
    });
    revalidatePath("/", "layout");
    return { ok: true };
  }

  if (email && !session) {
    await notifyWelcomeIfNeeded({
      email,
      name: parsed.data.fullName.trim(),
      event: "sign_up",
    });
    return { ok: true, needsEmailConfirmation: true };
  }

  return { ok: false, error: "No se pudo crear la cuenta. Inténtalo de nuevo." };
}

export async function signOutAction(): Promise<void> {
  if (!hasSupabaseCredentials()) {
    redirect("/login");
  }

  const supabase = createClient(await cookies());
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
