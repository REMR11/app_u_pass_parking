import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { getTenantConfig } from "@/config/tenant";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const tenant = getTenantConfig();

export const metadata: Metadata = {
  title: {
    default: tenant.appName,
    template: `%s · ${tenant.shortName}`,
  },
  description: "Gestión de acceso a estacionamiento multi-edificio y pagos móviles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="bg-background">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-[family-name:var(--font-geist-sans)]`}
        style={{ "--tenant-primary-hue": tenant.primaryHue } as React.CSSProperties}
      >
        <AuthSessionProvider>{children}</AuthSessionProvider>
      </body>
    </html>
  );
}
