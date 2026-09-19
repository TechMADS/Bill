import { AppLayoutClient } from "./AppLayoutClient";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const shopName = process.env.GOOGLE_APPS_SCRIPT_SHOP_ID || "Shop";
  return <AppLayoutClient shopName={shopName}>{children}</AppLayoutClient>;
}
