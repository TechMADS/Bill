import { NextRequest, NextResponse } from "next/server";
import { setShopAuthCookie } from "@/lib/server-auth";

const normalizeError = (message: string) => {
  if (!message) return "Invalid username or password";
  return message.includes("Unable to connect") || message.includes("Google Apps Script")
    ? "Unable to connect to the billing server. Please try again."
    : "Invalid username or password";
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const username = String(body?.username ?? "").trim();
    const password = String(body?.password ?? "").trim();

    if (!username || !password) {
      return NextResponse.json({ success: false, message: "Invalid username or password" }, { status: 401 });
    }

    const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    if (!scriptUrl) {
      return NextResponse.json({ success: false, message: "Unable to connect to the billing server. Please try again." }, { status: 503 });
    }

    const url = new URL(scriptUrl);
    url.searchParams.set("action", "login");

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", username, password }),
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data || typeof data !== "object") {
      return NextResponse.json({ success: false, message: "Unable to connect to the billing server. Please try again." }, { status: 503 });
    }

    if (data.success === false) {
      return NextResponse.json({ success: false, message: "Invalid username or password" }, { status: 401 });
    }

    const shopId = String(data.shopId || "").trim();
    const businessName = String(data.businessName || data.shopId || "").trim();
    if (!shopId) {
      return NextResponse.json({ success: false, message: "Invalid username or password" }, { status: 401 });
    }

    const result = NextResponse.json({
      success: true,
      shopId,
      businessName,
      profile: {
        businessName: data.businessName || "",
        ownerName: data.ownerName || "",
        phone: data.phone || "",
        address: data.address || "",
        gstNumber: data.gstNumber || "",
        state: data.state || "",
        email: data.email || "",
        username: data.username || "",
        password: data.password || "",
      },
    });
    setShopAuthCookie(result, shopId, request);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to connect to the billing server. Please try again.";
    return NextResponse.json({ success: false, message: normalizeError(message) }, { status: 503 });
  }
}
