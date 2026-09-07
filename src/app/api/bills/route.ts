import { NextRequest, NextResponse } from "next/server";

const getConfiguration = () => {
  const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  const shopId = process.env.GOOGLE_APPS_SCRIPT_SHOP_ID;

  if (!scriptUrl || !shopId) {
    throw new Error("Google Apps Script URL and shop ID are not configured");
  }

  return { scriptUrl, shopId };
};

const readJson = async (response: Response): Promise<unknown> => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    throw new Error("Google Apps Script returned an invalid response");
  }
};

const forwardResponse = (data: unknown) => NextResponse.json(data, { status: 200 });

class RequestError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const ensureUpstreamSuccess = (data: unknown) => {
  if (!data || typeof data !== "object") return data;
  const result = data as Record<string, unknown>;
  if (result.success === false || result.status === "error" || result.error) {
    throw new RequestError(502, String(result.error ?? result.message ?? "Google Apps Script rejected the request"));
  }
  return data;
};

const fieldsForGoogleSheets = (fields: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(fields).filter(([key]) => key.toLowerCase() !== "upi transaction id")
  );

const handleError = (error: unknown) => {
  const message = error instanceof Error ? error.message : "Unexpected billing service error";
  const status = error instanceof RequestError
    ? error.status
    : message.includes("not configured") ? 500 : 502;
  return NextResponse.json({ error: message }, { status });
};

export async function GET() {
  try {
    const { scriptUrl, shopId } = getConfiguration();
    const url = new URL(scriptUrl);
    url.searchParams.set("action", "get");
    url.searchParams.set("shopId", shopId);

    const response = await fetch(url, { cache: "no-store" });
    const data = ensureUpstreamSuccess(await readJson(response));
    if (!response.ok) throw new Error("Failed to fetch bills from Google Sheets");
    return forwardResponse(data);
  } catch (error) {
    return handleError(error);
  }
}

const forwardMutation = async (request: Request, action: "create" | "update" | "delete") => {
  const { scriptUrl, shopId } = getConfiguration();
  const body = await request.json();
  if (!body || typeof body !== "object") {
    throw new RequestError(400, "A JSON request body is required");
  }
  if (action !== "delete" && (!body.fields || typeof body.fields !== "object" || Object.keys(body.fields).length === 0)) {
    throw new RequestError(400, "Bill fields are required");
  }
  if (action !== "create" && !Number.isFinite(Number(body.rowNumber))) {
    throw new RequestError(400, "A valid sheet row number is required");
  }
  const payload = {
    ...body,
    action,
    shopId,
    ...(action === "delete" ? {} : { fields: fieldsForGoogleSheets(body.fields) }),
  };

  const response = await fetch(scriptUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = ensureUpstreamSuccess(await readJson(response));
  if (!response.ok) throw new Error(`Failed to ${action} bill in Google Sheets`);
  return forwardResponse(data);
};

export async function POST(request: NextRequest) {
  try {
    return await forwardMutation(request, "create");
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    return await forwardMutation(request, "update");
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    return await forwardMutation(request, "delete");
  } catch (error) {
    return handleError(error);
  }
}