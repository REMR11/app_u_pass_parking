import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { z } from "zod";
import { maybeSendWelcomeAfterSignIn } from "@/lib/notifications/auth-hooks";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
  }
}

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

function microsoftEntraConfigured(): boolean {
  return Boolean(
    process.env.AUTH_MICROSOFT_ENTRA_ID_ID?.trim() &&
      process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET?.trim(),
  );
}

function credentialsDemoConfigured(): boolean {
  return Boolean(
    process.env.AUTH_DEMO_EMAIL?.trim() &&
      process.env.AUTH_DEMO_PASSWORD?.trim(),
  );
}

const providers = [];

if (microsoftEntraConfigured()) {
  const tenantId = process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID?.trim();
  providers.push(
    MicrosoftEntraID({
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID as string,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET as string,
      ...(tenantId
        ? { issuer: `https://login.microsoftonline.com/${tenantId}/v2.0` }
        : {}),
    }),
  );
}

// Always add credentials provider - supports demo login or can be connected to a real database
providers.push(
  Credentials({
    name: "Correo y contraseña",
    credentials: {
      email: { label: "Correo", type: "email" },
      password: { label: "Contraseña", type: "password" },
    },
    authorize: async (credentials) => {
      const parsed = credentialsSchema.safeParse(credentials);
      if (!parsed.success) return null;

      // Check for demo credentials first
      const demoEmail = process.env.AUTH_DEMO_EMAIL;
      const demoPassword = process.env.AUTH_DEMO_PASSWORD;
      
      if (demoEmail && demoPassword) {
        if (
          parsed.data.email.toLowerCase() === demoEmail.toLowerCase() &&
          parsed.data.password === demoPassword
        ) {
          return {
            id: "user-demo-1",
            email: demoEmail,
            name: process.env.AUTH_DEMO_NAME ?? "Administrador",
          };
        }
      }

      // TODO: Add real database authentication here
      // For now, allow any valid email/password combination for testing
      // In production, this should validate against a user database
      if (parsed.data.email && parsed.data.password.length >= 4) {
        return {
          id: `user-${Date.now()}`,
          email: parsed.data.email,
          name: parsed.data.email.split("@")[0],
        };
      }

      return null;
    },
  }),
);

// Note: We no longer need a fallback provider since credentials is always available

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7,
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  events: {
    signIn: maybeSendWelcomeAfterSignIn,
  },
});

export function isMicrosoftEntraLoginAvailable(): boolean {
  return microsoftEntraConfigured();
}

export function isCredentialsLoginAvailable(): boolean {
  // Always show credentials login - it can work with demo credentials or be connected to a real DB later
  return true;
}
