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
  fields?: BillFields;
}

export interface CreateBillInput {
  fields: BillFields;
}

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
  const amountText = sourceValueFor(source, fields, ["amount", "amount (₹)"]);
  const rowNumber = Number(source.__rowNumber ?? source.rowNumber ?? source.row ?? index + 2);

  return {
    id: String(source.id ?? source.billId ?? source.billID ?? rowNumber),
    rowNumber: Number.isFinite(rowNumber) ? rowNumber : undefined,
    receiptNumber: sourceValueFor(source, fields, ["receipt number", "invoice number"]),
    date: sourceValueFor(source, fields, ["date"]),
    customerName: sourceValueFor(source, fields, ["customer name"]),
    customerPhone: sourceValueFor(source, fields, ["phone number", "phone", "customer number"]),
    paymentReceivedBy: sourceValueFor(source, fields, ["received by", "payment received by"]),
    amount: Number(amountText) || 0,
    paymentMethod: sourceValueFor(source, fields, ["payment method"]) as PaymentMethod,
    amountInWords: sourceValueFor(source, fields, ["amount in words"]),
    createdAt: sourceValueFor(source, fields, ["createdat", "created at", "created_at"]),
    updatedAt: sourceValueFor(source, fields, ["updatedat", "updated at", "updated_at"]),
    fields,
  };
};

export const getBills = async (): Promise<Bill[]> => {
  const data = await readResponse(await fetch("/api/bills", { cache: "no-store" }));
  return responseRecords(data).map(toBill);
};

export const createBill = async (input: CreateBillInput): Promise<Bill> => {
  const fields = input.fields;
  const data = await readResponse(await fetch("/api/bills", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
  }));
  const records = responseRecords(data);
  const result = records[0] ?? data;
  const source = result && typeof result === "object" ? result as Record<string, unknown> : {};
  const createdBill = {
    ...toBill({ ...source, fields }, 0),
  };
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

export const billCreatedAt = (bill: Bill): number => {
  const createdAt = Date.parse(bill.createdAt);
  return Number.isNaN(createdAt) ? (bill.rowNumber ?? 0) : createdAt;
};

export const sortBillsNewestFirst = (bills: Bill[]): Bill[] =>
  [...bills].sort((a, b) => billCreatedAt(b) - billCreatedAt(a));

export const updateBill = async (rowNumber: number, fields: BillFields): Promise<void> => {
  await readResponse(await fetch("/api/bills", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rowNumber, fields }),
  }));
};

export const deleteBill = async (rowNumber: number): Promise<void> => {
  await readResponse(await fetch("/api/bills", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
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
