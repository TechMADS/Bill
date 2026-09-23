export interface AuthSession {
  shopId: string;
  username?: string;
  businessName?: string;
  profile?: Record<string, string>;
}

const AUTH_SESSION_KEY = "billing_shop_session";

const keyForShopSettings = (shopId?: string) => (shopId ? `settings_v3_${shopId}` : "settings_v3");

const toComparableKey = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const getFirstValue = (source: Record<string, unknown>, keys: string[]) => {
  const normalizedSource = Object.fromEntries(
    Object.entries(source).map(([key, value]) => [toComparableKey(key), value])
  );

  for (const key of keys) {
    const comparableKey = toComparableKey(key);
    if (Object.prototype.hasOwnProperty.call(normalizedSource, comparableKey)) {
      const value = normalizedSource[comparableKey];
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        return String(value);
      }
    }
  }

  return "";
};

const normalizeProfile = (profile: Record<string, unknown> = {}): Record<string, string> => ({
  businessName: getFirstValue(profile, ["Business Name", "businessName", "Shop Name"]),
  businessLegalName: getFirstValue(profile, ["Business Legal Name", "businessLegalName", "Legal Name"]),
  ownerName: getFirstValue(profile, ["Owner Name", "ownerName", "Owner"]),
  phone: getFirstValue(profile, ["Phone", "phone", "Phone Number"]),
  email: getFirstValue(profile, ["Email", "email"]),
  address: getFirstValue(profile, ["Address", "address", "Business Address"]),
  state: getFirstValue(profile, ["State", "state"]),
  stateCode: getFirstValue(profile, ["State Code", "stateCode"]),
  gstNumber: getFirstValue(profile, ["GST Number", "GSTIN", "gstNumber", "gstin"]),
  bankName: getFirstValue(profile, ["Bank Name", "bankName"]),
  accountNumber: getFirstValue(profile, ["Account Number", "accountNumber"]),
  ifsc: getFirstValue(profile, ["IFSC", "ifsc"]),
  defaultReceiverName: getFirstValue(profile, ["Default Receiver Name", "defaultReceiverName"]),
  logo: getFirstValue(profile, ["Logo", "logo"]),
});

export const getAuthSession = (): AuthSession | null => {
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(AUTH_SESSION_KEY);
    if (!value) return null;
    const parsed = JSON.parse(value) as Partial<AuthSession>;
    if (!parsed || typeof parsed !== "object" || !parsed.shopId) {
      return null;
    }
    return parsed as AuthSession;
  } catch {
    return null;
  }
};

export const setAuthSession = (session: AuthSession | null) => {
  if (typeof window === "undefined") return;

  if (session) {
    window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
    if (session.profile) {
      window.localStorage.setItem(keyForShopSettings(session.shopId), JSON.stringify(session.profile));
    }
  } else {
    window.localStorage.removeItem(AUTH_SESSION_KEY);
  }

  window.dispatchEvent(new Event("auth:changed"));
};

export const clearAuthSession = () => setAuthSession(null);

export const getAuthenticatedShopId = (): string => {
  if (typeof window === "undefined") return "";

  return getAuthSession()?.shopId?.trim() || "";
};

export const getActiveShopId = (): string => {
  if (typeof window !== "undefined") {
    const authenticatedShopId = getAuthenticatedShopId();
    if (authenticatedShopId) {
      return authenticatedShopId;
    }
  }

  return "";
};

export const storeShopProfile = (shopId: string, profile: Record<string, unknown>) => {
  if (typeof window === "undefined") return;

  const normalized = normalizeProfile(profile);
  window.localStorage.setItem(keyForShopSettings(shopId), JSON.stringify(normalized));
  window.localStorage.setItem("settings_v3", JSON.stringify(normalized));

  const session = getAuthSession();
  if (session && session.shopId === shopId) {
    setAuthSession({
      ...session,
      profile: normalized,
      businessName: normalized.businessName || session.businessName,
    });
  }
};

export const loadShopProfile = async (shopId: string): Promise<Record<string, string>> => {
  const response = await fetch("/api/auth/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ shopId }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.success === false) {
    throw new Error(data?.error || "Unable to load the shop profile.");
  }

  const profile = data.profile || data.shop || data.data || {};
  const normalized = normalizeProfile(profile);
  storeShopProfile(shopId, normalized);
  return normalized;
};

export const loginWithCredentials = async (username: string, password: string) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ username, password }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data?.success !== true) {
    throw new Error(data?.error || "Invalid username or password.");
  }

  const shopId = String(data.shopId || "").trim();
  if (!shopId) {
    throw new Error("Unable to determine the active shop.");
  }

  const profile = normalizeProfile(data.profile || data.shop || data.data || {});
  storeShopProfile(shopId, profile);

  return {
    shopId,
    businessName: profile.businessName || data.businessName || shopId,
    profile,
  };
};
