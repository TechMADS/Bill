import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const AUTH_COOKIE_NAME = "billing_shop_auth";

const getSigningSecret = () => process.env.AUTH_SESSION_SECRET || process.env.GOOGLE_APPS_SCRIPT_URL || "";
const signatureFor = (shopId: string) => createHmac("sha256", getSigningSecret()).update(shopId).digest("base64url");

export const createShopAuthToken = (shopId: string) =>
  `${Buffer.from(shopId, "utf8").toString("base64url")}.${signatureFor(shopId)}`;

export const getAuthenticatedShopId = (request: NextRequest): string => {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value || "";
  const [encodedShopId, providedSignature] = token.split(".");
  if (!encodedShopId || !providedSignature || !getSigningSecret()) return "";

  try {
    const shopId = Buffer.from(encodedShopId, "base64url").toString("utf8").trim();
    const expected = Buffer.from(signatureFor(shopId));
    const provided = Buffer.from(providedSignature);
    if (!shopId || expected.length !== provided.length || !timingSafeEqual(expected, provided)) return "";
    return shopId;
  } catch {
    return "";
  }
};

const requestUsesHttps = (request: NextRequest) => {
  const forwardedProtocol = request.headers.get("x-forwarded-proto")?.split(",")[0].trim();
  return forwardedProtocol === "https" || request.nextUrl.protocol === "https:";
};

export const setShopAuthCookie = (response: NextResponse, shopId: string, request: NextRequest) => {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: createShopAuthToken(shopId),
    httpOnly: true,
    sameSite: "lax",
    secure: requestUsesHttps(request),
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
};

export const clearShopAuthCookie = (response: NextResponse, request: NextRequest) => {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: requestUsesHttps(request),
    path: "/",
    maxAge: 0,
  });
};