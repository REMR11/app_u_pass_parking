import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";

export default async function ParkingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ensure user is authenticated
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-dvh bg-background">
      {children}
      <BottomNav />
    </div>
  );
}
