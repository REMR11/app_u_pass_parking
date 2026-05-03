import { BottomNav } from "@/components/layout/bottom-nav";

export default function ParkingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background pb-20">
      {children}
      <BottomNav />
    </div>
  );
}
