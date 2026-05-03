import type { Account, User } from "next-auth";
import { getWelcomeNotificationMode } from "@/lib/notifications/config";
import { sendWelcomeEmail } from "@/lib/notifications/service";

function shouldSendWelcome(params: {
  account: Account | null;
  isNewUser?: boolean;
}): boolean {
  const mode = getWelcomeNotificationMode();
  if (mode === "off") return false;
  if (mode === "each_signin") return true;
  return params.isNewUser === true;
}

/**
 * Invocado desde `events.signIn` de Auth.js. Errores se registran y no bloquean el login.
 */
export async function maybeSendWelcomeAfterSignIn(message: {
  user: User;
  account: Account | null;
  profile?: unknown;
  isNewUser?: boolean;
}): Promise<void> {
  const email = message.user.email?.trim();
  if (!email) return;

  if (!shouldSendWelcome({ account: message.account, isNewUser: message.isNewUser })) {
    return;
  }

  try {
    const result = await sendWelcomeEmail({ to: email, name: message.user.name });
    if (!result.ok && result.reason !== "no_transport") {
      console.warn("[notifications:welcome]", result);
    }
  } catch (e) {
    console.warn("[notifications:welcome:error]", e);
  }
}
