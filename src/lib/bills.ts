import { getAuthenticatedShopId } from "@/lib/auth";

export type PaymentMethod = "Cash" | "UPI";

export type BillFields = Record<string, string>;

export interface Bill {
  id: string;
  rowNumber?: number;
  receiptNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  paymentReceivedBy: string;
  amount: number;
  paymentMethod: PaymentMethod;
  amountInWords: string;
  createdAt: string;
  updatedAt: string;
  amountValid?: boolean;
  fields?: BillFields;
}

export interface CreateBillInput {
  fields: BillFields;
}

const BILL_NAVIGATION_CACHE_KEY = "billing_selected_bill";

export const cacheBillForNavigation = (bill: Bill): void => {
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(BILL_NAVIGATION_CACHE_KEY, JSON.stringify(bill));
  }
};

export const consumeCachedBill = (id: string): Bill | null => {
  if (typeof window === "undefined") return null;

  const cached = window.sessionStorage.getItem(BILL_NAVIGATION_CACHE_KEY);
  window.sessionStorage.removeItem(BILL_NAVIGATION_CACHE_KEY);
  if (!cached) return null;

  try {
    const bill = JSON.parse(cached) as Bill;
    return bill.id === id || bill.receiptNumber === id ? bill : null;
  } catch {
    return null;
  }
};

const readResponse = async (response: Response): Promise<unknown> => {
  const data: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data && typeof data === "object" && "error" in data
      ? String(data.error)
      : "The billing service request failed";
    throw new Error(message);
  }
  return data;
};

const normalizeKey = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]/g, "");

const valueFor = (fields: BillFields, names: string[]): string => {
  const normalizedNames = names.map(normalizeKey);
  const key = Object.keys(fields).find(field => normalizedNames.includes(normalizeKey(field)));
  return key ? fields[key] : "";
};

export const sourceFieldValue = (fields: BillFields, names: string[]): string => valueFor(fields, names);

const sourceValueFor = (source: Record<string, unknown>, fields: BillFields, names: string[]): string => {
  const normalizedNames = names.map(normalizeKey);
  const sourceKey = Object.keys(source).find(key => normalizedNames.includes(normalizeKey(key)));
  return sourceKey ? String(source[sourceKey] ?? "") : valueFor(fields, names);
};

const parseAmount = (value: unknown): { value: number; valid: boolean } => {
  if (typeof value === "number") return Number.isFinite(value) ? { value, valid: true } : { value: 0, valid: false };
  const text = String(value ?? "").trim();
  if (!text) return { value: 0, valid: false };

  const normalized = text.replace(/[₹,\s]/g, "").replace(/^\((.*)\)$/, "-$1");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? { value: parsed, valid: true } : { value: 0, valid: false };
};

const responseRecords = (data: unknown): unknown[] => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    for (const key of ["data", "bills", "records", "result"]) {
      const nested = record[key];
      if (Array.isArray(nested)) return nested;
      if (nested && typeof nested === "object") {
        const nestedRecords = responseRecords(nested);
        if (nestedRecords.length > 0) return nestedRecords;
      }
    }
    if (record.bill && typeof record.bill === "object") return [record.bill];
    if ("receiptNumber" in record || "receipt number" in record || "invoiceNumber" in record) return [record];
  }
  return [];
};

const toBill = (record: unknown, index: number): Bill => {
  const source = record && typeof record === "object" ? record as Record<string, unknown> : {};
  const rawFields = source.fields && typeof source.fields === "object"
    ? source.fields as Record<string, unknown>
    : Object.fromEntries(Object.entries(source).filter(([key]) => !["id", "row", "rowNumber", "__rowNumber"].includes(key)));
  const fields: BillFields = Object.fromEntries(
    Object.entries(rawFields).map(([key, value]) => [key, String(value ?? "")])
  );
  const amountText = sourceValueFor(source, fields, ["amount", "amount (₹)", "total amount", "bill amount", "price"]);
  const parsedAmount = parseAmount(amountText);
  const rowNumber = Number(source.__rowNumber ?? source.rowNumber ?? source.row ?? index + 2);

  return {
    id: String(source.id ?? source.billId ?? source.billID ?? rowNumber),
    rowNumber: Number.isFinite(rowNumber) ? rowNumber : undefined,
    receiptNumber: sourceValueFor(source, fields, ["receipt number", "receipt no", "receipt id", "invoice number", "invoice no"]),
    date: sourceValueFor(source, fields, ["date", "bill date", "invoice date"]),
    customerName: sourceValueFor(source, fields, ["customer name", "customer"]),
    customerPhone: sourceValueFor(source, fields, ["customer phone", "phone number", "phone", "customer number"]),
    paymentReceivedBy: sourceValueFor(source, fields, ["payment received by number"]),
    amount: parsedAmount.value,
    amountValid: parsedAmount.valid,
    paymentMethod: sourceValueFor(source, fields, ["payment method", "payment mode", "mode"]).trim().toLowerCase() === "upi" ? "UPI" : "Cash",
    amountInWords: sourceValueFor(source, fields, ["amount in words"]),
    createdAt: sourceValueFor(source, fields, ["createdat", "created at", "created_at"]),
    updatedAt: sourceValueFor(source, fields, ["updatedat", "updated at", "updated_at"]),
    fields,
  };
};

const requireAuthenticatedShopId = (): string => {
  const shopId = getAuthenticatedShopId();
  if (!shopId) {
    throw new Error("No authenticated shop is available for this request.");
  }
  return shopId;
};

export const getBills = async (): Promise<Bill[]> => {
  requireAuthenticatedShopId();
  const data = await readResponse(await fetch("/api/bills", {
    cache: "no-store",
    credentials: "include",
  }));
  return responseRecords(data).map(toBill);
};

export const createBill = async (input: CreateBillInput): Promise<Bill> => {
  requireAuthenticatedShopId();
  const fields = input.fields;
  const data = await readResponse(await fetch("/api/bills", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ fields }),
  }));
  const records = responseRecords(data);
  const result = records[0] ?? data;
  const source = result && typeof result === "object" ? result as Record<string, unknown> : {};
  const responseRowNumber = Number(
    source.rowNumber ?? source.row ?? source.__rowNumber ?? (data && typeof data === "object" ? (data as Record<string, unknown>).rowNumber : undefined)
  );
  const createdBill = {
    ...toBill({ ...source, fields, __rowNumber: responseRowNumber }, 0),
  };
  if (Number.isFinite(responseRowNumber) && createdBill.receiptNumber === input.fields["Receipt Number"]) {
    window.dispatchEvent(new CustomEvent("bill:created", { detail: createdBill }));
    return createdBill;
  }
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const savedBills = await getBills();
    const exactMatch = savedBills
      .filter(bill => bill.receiptNumber === input.fields["Receipt Number"])
      .sort((a, b) => billCreatedAt(b) - billCreatedAt(a))[0];
    if (exactMatch) {
      const savedBill = exactMatch;
      window.dispatchEvent(new CustomEvent("bill:created", { detail: savedBill }));
      return savedBill;
    }
    if (attempt < 2) await new Promise(resolve => setTimeout(resolve, 400));
  }

  const responseContainsPersistentIdentity = Boolean(
    source.id || source.billId || source.billID || source.row || source.rowNumber || source.__rowNumber
  );
  if (responseContainsPersistentIdentity && createdBill.receiptNumber === input.fields["Receipt Number"]) {
    return createdBill;
  }
  throw new Error("The bill was saved, but it could not be found by its receipt number. Refresh Bill History and try again.");
};

export const billDateKey = (date: string): string => {
  const value = String(date ?? "").trim();
  const isoDate = value.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (isoDate) {
    return `${isoDate[1]}-${isoDate[2].padStart(2, "0")}-${isoDate[3].padStart(2, "0")}`;
  }

  const dayFirstDate = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (dayFirstDate) {
    return `${dayFirstDate[3]}-${dayFirstDate[2].padStart(2, "0")}-${dayFirstDate[1].padStart(2, "0")}`;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? ""
    : `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, "0")}-${String(parsed.getDate()).padStart(2, "0")}`;
};

export const formatBillDate = (date: string): string => {
  const key = billDateKey(date);
  if (!key) return "";
  const [year, month, day] = key.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(year, month - 1, day));
};

export const billCreatedAt = (bill: Bill): number => {
  const createdAt = Date.parse(bill.createdAt);
  return Number.isNaN(createdAt) ? (bill.rowNumber ?? 0) : createdAt;
};

export const sortBillsNewestFirst = (bills: Bill[]): Bill[] =>
  [...bills].sort((a, b) => billCreatedAt(b) - billCreatedAt(a));

export const updateBill = async (rowNumber: number, fields: BillFields): Promise<void> => {
  requireAuthenticatedShopId();
  await readResponse(await fetch("/api/bills", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ rowNumber, fields }),
  }));
};

export const deleteBill = async (rowNumber: number): Promise<void> => {
  requireAuthenticatedShopId();
  await readResponse(await fetch("/api/bills", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ rowNumber }),
  }));
};

export const getNextReceiptNumber = async (): Promise<string> => {
  const bills = await getBills();
  const highestReceiptNumber = bills.reduce((highest, bill) => {
    const value = bill.receiptNumber.trim();
    const match = value.match(/(?:REC-)?(\d+)$/i);
    return match ? Math.max(highest, Number(match[1])) : highest;
  }, 0);

  return `REC-${String(highestReceiptNumber + 1).padStart(6, "0")}`;
};

export const resetReceiptSequenceForDemo = (_seq: number) => undefined;
