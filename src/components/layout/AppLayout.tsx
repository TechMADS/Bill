"use client";

import { useEffect, useState } from "react";
import { AppLayoutClient } from "./AppLayoutClient";
import { getAuthSession } from "@/lib/auth";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [shopName, setShopName] = useState("");

  useEffect(() => {
    const updateShopName = async () => {
      const session = getAuthSession();
      if (!session?.shopId) {
        setShopName("");
        return;
      }

      try {
        const response = await fetch("/api/auth/profile", {
          credentials: "include",
          cache: "no-store",
        });
        const profile = await response.json().catch(() => ({}));
        if (response.ok && profile.success !== false && profile.businessName) {
          setShopName(String(profile.businessName));
        } else {
          setShopName(session.businessName || "");
        }
      } catch {
        setShopName(session.businessName || "");
      }
    };

    void updateShopName();
    window.addEventListener("auth:changed", updateShopName);
    window.addEventListener("profile:changed", updateShopName);
    return () => {
      window.removeEventListener("auth:changed", updateShopName);
      window.removeEventListener("profile:changed", updateShopName);
    };
  }, []);

  return <AppLayoutClient shopName={shopName}>{children}</AppLayoutClient>;
}
