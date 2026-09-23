import { getData, storeData } from "./storage";
import { getActiveShopId } from "@/lib/auth";

export interface BusinessSettings {
  businessName: string;
  businessLegalName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  state: string;
  stateCode: string;
  logo: string;
  gstNumber: string;
  bankName: string;
  accountNumber: string;
  ifsc: string;
  defaultReceiverName: string;
  username: string;
  password: string;
}

const defaultSettings: BusinessSettings = {
  businessName: "Acme Corp",
  businessLegalName: "",
  ownerName: "John Doe",
  phone: "+1 (555) 123-4567",
  email: "",
  address: "123 Business Rd, Tech City, TC 10101",
  state: "",
  stateCode: "",
  logo: "",
  gstNumber: "",
  bankName: "",
  accountNumber: "",
  ifsc: "",
  defaultReceiverName: "Admin",
  username: "",
  password: "",
};

const toSettings = (profile: Record<string, unknown>): BusinessSettings => ({
  ...defaultSettings,
  businessName: String(profile.businessName || ""),
  ownerName: String(profile.ownerName || ""),
  phone: String(profile.phone || ""),
  address: String(profile.address || ""),
  email: String(profile.email || ""),
  gstNumber: String(profile.gstNumber || ""),
  state: String(profile.state || ""),
  username: String(profile.username || ""),
  password: String(profile.password || ""),
});

const keyForShopSettings = (shopId?: string) => (shopId ? `settings_v3_${shopId}` : "settings_v3");

export const getSettings = (): BusinessSettings => {
  const shopId = getActiveShopId();
  const settings = getData(keyForShopSettings(shopId), {});
  return {
    ...defaultSettings,
    ...settings,
  };
};

export const saveSettings = (settings: BusinessSettings) => {
  const shopId = getActiveShopId();
  storeData(keyForShopSettings(shopId), settings);
  storeData("settings_v3", settings);
};

export const getAuthenticatedSettings = async (): Promise<BusinessSettings> => {
  const response = await fetch("/api/auth/profile", { credentials: "include", cache: "no-store" });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) throw new Error(payload.message || "Unable to load shop settings.");
  return toSettings(payload);
};

export const saveAuthenticatedSettings = async (settings: BusinessSettings): Promise<BusinessSettings> => {
  const response = await fetch("/api/auth/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ fields: {
      "Business Name": settings.businessName,
      "Owner Name": settings.ownerName,
      Phone: settings.phone,
      Address: settings.address,
      "GST Number": settings.gstNumber,
      State: settings.state,
      Username: settings.username,
      Password: settings.password,
    } }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success === false) throw new Error(payload.message || "Unable to save shop settings.");
  const savedSettings = toSettings(payload);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("profile:changed"));
  }
  return savedSettings;
};
