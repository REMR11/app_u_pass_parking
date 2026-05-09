"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
}

function MapIcon({ className, filled }: { className?: string; filled?: boolean }) {
  if (filled) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" fill="white" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function CalendarIcon({ className, filled }: { className?: string; filled?: boolean }) {
  if (filled) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <rect x="3" y="4" width="18" height="6" rx="2" ry="2" fill="currentColor" />
        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" />
        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function CreditCardIcon({ className, filled }: { className?: string; filled?: boolean }) {
  if (filled) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <rect x="1" y="10" width="22" height="4" fill="white" opacity="0.3" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

function UserIcon({ className, filled }: { className?: string; filled?: boolean }) {
  if (filled) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="7" r="4" />
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

const navItems: NavItem[] = [
  { 
    href: "/parking", 
    label: "Mapa", 
    icon: <MapIcon className="w-6 h-6" />,
    activeIcon: <MapIcon className="w-6 h-6" filled />
  },
  { 
    href: "/parking/reservations", 
    label: "Reservas", 
    icon: <CalendarIcon className="w-6 h-6" />,
    activeIcon: <CalendarIcon className="w-6 h-6" filled />
  },
  { 
    href: "/dashboard/payments", 
    label: "Pagos", 
    icon: <CreditCardIcon className="w-6 h-6" />,
    activeIcon: <CreditCardIcon className="w-6 h-6" filled />
  },
  { 
    href: "/dashboard", 
    label: "Perfil", 
    icon: <UserIcon className="w-6 h-6" />,
    activeIcon: <UserIcon className="w-6 h-6" filled />
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 bg-background/95 backdrop-blur-sm border-t border-foreground/10 lg:hidden">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto pb-safe">
        {navItems.map((item) => {
          // Check if this nav item is active
          const isActive = pathname === item.href || 
            (item.href !== "/dashboard" && pathname.startsWith(item.href + "/")) ||
            (item.href === "/dashboard" && pathname === "/dashboard");
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center justify-center gap-0.5 px-4 py-2 min-w-[64px] transition-all
                ${isActive 
                  ? "text-primary" 
                  : "text-foreground/50 active:text-foreground/70"
                }
              `}
            >
              <span className="transition-transform duration-200 ease-out" style={{ transform: isActive ? 'scale(1.1)' : 'scale(1)' }}>
                {isActive ? item.activeIcon : item.icon}
              </span>
              <span className={`text-[10px] font-semibold ${isActive ? 'text-primary' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
