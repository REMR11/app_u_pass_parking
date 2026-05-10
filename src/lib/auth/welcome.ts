import { getWelcomeNotificationMode } from "@/lib/notifications/config";
import { sendWelcomeEmail } from "@/lib/notifications/service";

export type WelcomeAuthEvent = "sign_in" | "sign_up";

/**
 * Correo de bienvenida tras login/registro con Supabase (no bloquea el flujo).
 */
export async function notifyWelcomeIfNeeded(params: {
  email: string;
  name?: string | null;
  event: WelcomeAuthEvent;
}): Promise<void> {
  const mode = getWelcomeNotificationMode();
  if (mode === "off") return;
  if (mode === "new_user_only" && params.event === "sign_in") return;

  try {
    const result = await sendWelcomeEmail({ to: params.email, name: params.name });
    if (!result.ok && result.reason !== "no_transport") {
      console.warn("[notifications:welcome]", result);
    }
  } catch (e) {
    console.warn("[notifications:welcome:error]", e);
  }
}
