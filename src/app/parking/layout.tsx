import { redirect } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { getSessionUser } from "@/lib/auth/session";

export default async function ParkingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login?callbackUrl=/parking");
  }

  return (
    <div className="min-h-dvh bg-background">
      {children}
      <BottomNav />
    </div>
  );
}
