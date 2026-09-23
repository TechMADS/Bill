import { NextRequest, NextResponse } from "next/server";
import { clearShopAuthCookie } from "@/lib/server-auth";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  clearShopAuthCookie(response, request);
  return response;
}