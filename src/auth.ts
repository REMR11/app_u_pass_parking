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

if (credentialsDemoConfigured()) {
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

        const demoEmail = process.env.AUTH_DEMO_EMAIL;
        if (!demoEmail || parsed.data.email.toLowerCase() !== demoEmail.toLowerCase()) {
          return null;
        }

        const plain = process.env.AUTH_DEMO_PASSWORD;
        if (!plain || parsed.data.password !== plain) {
          return null;
        }

        return {
          id: "user-demo-1",
          email: demoEmail,
          name: process.env.AUTH_DEMO_NAME ?? "Administrador",
        };
      },
    }),
  );
}

if (providers.length === 0) {
  providers.push(
    Credentials({
      id: "misconfigured",
      name: "Sin proveedores",
      credentials: {},
      authorize: async () => null,
    }),
  );
}

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
  return credentialsDemoConfigured();
}
