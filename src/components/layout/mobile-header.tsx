"use client";

import { TenantLogo } from "@/components/tenant/tenant-logo";
import { getTenantConfig } from "@/config/tenant";

interface MobileHeaderProps {
  title?: string;
  subtitle?: string;
  showMenu?: boolean;
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export function MobileHeader({ title, subtitle, showMenu = true }: MobileHeaderProps) {
  const tenant = getTenantConfig();

  return (
    <header className="bg-primary text-primary-foreground">
      {/* Top bar with logo and menu */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-foreground/20 rounded-xl flex items-center justify-center">
            <TenantLogo className="h-6 w-auto brightness-0 invert" />
          </div>
          <span className="text-xl font-semibold">{tenant.shortName}</span>
        </div>
        
        {showMenu && (
          <button 
            className="p-2 hover:bg-primary-foreground/10 rounded-lg transition-colors"
            aria-label="Menu"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
        )}
      </div>
      
      {/* Title section */}
      {(title || subtitle) && (
        <div className="px-5 pb-6 pt-2">
          {title && (
            <h1 className="text-2xl font-semibold leading-tight">{title}</h1>
          )}
          {subtitle && (
            <p className="text-primary-foreground/80 mt-1">{subtitle}</p>
          )}
        </div>
      )}
    </header>
  );
}
