"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { getAuthSession } from "@/lib/auth";

const protectedPaths = [
  "/dashboard",
  "/create-bill",
  "/bills",
  "/customers",
  "/reports",
  "/settings",
  "/create-gst-bill",
  "/gst-bills",
];

const isProtectedRoute = (pathname: string) => {
  return protectedPaths.some(route => pathname === route || pathname.startsWith(`${route}/`));
};

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const session = getAuthSession();

    if (pathname === "/") {
      router.replace(session?.shopId ? "/dashboard" : "/login");
      return;
    }

    if (pathname === "/login") {
      if (session?.shopId) {
        router.replace("/dashboard");
      } else {
        setReady(true);
      }
      return;
    }

    if (isProtectedRoute(pathname) && !session?.shopId) {
      router.replace("/login");
      return;
    }

    setReady(true);
  }, [pathname, router]);

  if (pathname === "/login") {
    return <>{children}</>;
  }

  if (!ready) {
    return null;
  }

  return <AppLayout>{children}</AppLayout>;
}
