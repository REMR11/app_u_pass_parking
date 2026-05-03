import Image from "next/image";
import { getTenantConfig } from "@/config/tenant";

export function TenantLogo({ className }: { className?: string }) {
  const tenant = getTenantConfig();

  if (tenant.logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={tenant.logoUrl} alt={tenant.appName} className={className} />
    );
  }

  return (
    <Image
      src={tenant.logoPath}
      alt={tenant.appName}
      width={120}
      height={32}
      className={className}
      priority
      unoptimized
    />
  );
}
