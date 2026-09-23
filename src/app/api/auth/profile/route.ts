import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedShopId } from "@/lib/server-auth";

const getProfile = async (request: NextRequest) => {
  try {
    const shopId = getAuthenticatedShopId(request);
    if (!shopId) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    if (!scriptUrl) {
      return NextResponse.json({ success: false, message: "Unable to connect to the billing server. Please try again." }, { status: 503 });
    }

    const url = new URL(scriptUrl);
    url.searchParams.set("action", "profile");
    url.searchParams.set("shopId", shopId);
    const response = await fetch(url.toString(), { method: "GET", cache: "no-store" });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload || typeof payload !== "object" || payload.success === false) {
      return NextResponse.json({ success: false, message: payload?.message || "Shop not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      shopId: String(payload.shopId || shopId),
      businessName: payload.businessName || "",
      ownerName: payload.ownerName || "",
      phone: payload.phone || "",
      address: payload.address || "",
      gstNumber: payload.gstNumber || "",
      state: payload.state || "",
      email: payload.email || "",
      username: payload.username || "",
      password: payload.password || "",
    });
  } catch {
    return NextResponse.json({ success: false, message: "Unable to connect to the billing server. Please try again." }, { status: 503 });
  }
};

export async function GET(request: NextRequest) {
  return getProfile(request);
}

export async function POST(request: NextRequest) {
  return getProfile(request);
}

export async function PUT(request: NextRequest) {
  try {
    const shopId = getAuthenticatedShopId(request);
    if (!shopId) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const fields = body && typeof body === "object" && body.fields && typeof body.fields === "object" ? body.fields : {};
    const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
    if (!scriptUrl) {
      return NextResponse.json({ success: false, message: "Unable to connect to the billing server. Please try again." }, { status: 503 });
    }

    const url = new URL(scriptUrl);
    url.searchParams.set("action", "profile/update");
    const response = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "profile/update", shopId, fields }),
      cache: "no-store",
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload || payload.success === false) {
      return NextResponse.json({ success: false, message: payload?.message || "Unable to save shop profile" }, { status: 502 });
    }

    return NextResponse.json({ success: true, shopId, ...(payload.profile || {}) });
  } catch {
    return NextResponse.json({ success: false, message: "Unable to save shop profile" }, { status: 503 });
  }
}
