import { auth } from "@/auth";
import { redirect } from "next/navigation";

/**
 * Root page - Mobile-optimized app
 * Redirects authenticated users to the parking map view
 * Redirects unauthenticated users to login
 */
export default async function Home() {
  const session = await auth();

  if (session?.user) {
    // Authenticated: go directly to the map view
    redirect("/parking");
  }

  // Not authenticated: go to login
  redirect("/login");
}
