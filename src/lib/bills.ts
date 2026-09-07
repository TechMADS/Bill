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
  upiTransactionId?: string;
  amountInWords: string;
  createdAt: string;
  updatedAt: string;
  fields?: BillFields;
}

export interface CreateBillInput {
  fields: BillFields;
}

const fieldsForGoogleSheets = (fields: BillFields): BillFields =>
  Object.fromEntries(
    Object.entries(fields).filter(([key]) => key.toLowerCase() !== "upi transaction id")
  );

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

const valueFor = (fields: BillFields, names: string[]): string => {
  const key = Object.keys(fields).find(field => names.includes(field.toLowerCase()));
  return key ? fields[key] : "";
};

const responseRecords = (data: unknown): unknown[] => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    for (const key of ["data", "bills", "records", "result"]) {
      if (Array.isArray(record[key])) return record[key];
    }
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
  const amountText = valueFor(fields, ["amount", "amount (₹)"]);
  const rowNumber = Number(source.__rowNumber ?? source.rowNumber ?? source.row ?? index + 2);

  return {
    id: String(source.id ?? rowNumber),
    rowNumber: Number.isFinite(rowNumber) ? rowNumber : undefined,
    receiptNumber: valueFor(fields, ["receipt number", "invoice number"]),
    date: valueFor(fields, ["date"]),
    customerName: valueFor(fields, ["customer name"]),
    customerPhone: valueFor(fields, ["phone number", "phone", "customer number"]),
    paymentReceivedBy: valueFor(fields, ["received by", "payment received by"]),
    amount: Number(amountText) || 0,
    paymentMethod: valueFor(fields, ["payment method"]) as PaymentMethod,
    upiTransactionId: valueFor(fields, ["upi transaction id"]) || undefined,
    amountInWords: valueFor(fields, ["amount in words"]),
    createdAt: "",
    updatedAt: "",
    fields,
  };
};

export const getBills = async (): Promise<Bill[]> => {
  const data = await readResponse(await fetch("/api/bills", { cache: "no-store" }));
  return responseRecords(data).map(toBill);
};

export const createBill = async (input: CreateBillInput): Promise<Bill> => {
  const fields = fieldsForGoogleSheets(input.fields);
  const data = await readResponse(await fetch("/api/bills", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
  }));
  const records = responseRecords(data);
  const result = records[0] ?? data;
  const source = result && typeof result === "object" ? result as Record<string, unknown> : {};
  return {
    ...toBill({ ...source, fields }, 0),
    upiTransactionId: input.fields["UPI Transaction ID"] || undefined,
  };
};

export const updateBill = async (rowNumber: number, fields: BillFields): Promise<void> => {
  const persistedFields = fieldsForGoogleSheets(fields);
  await readResponse(await fetch("/api/bills", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rowNumber, fields: persistedFields }),
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
    if (!/^\d+$/.test(value)) return highest;
    return Math.max(highest, Number(value));
  }, 0);

  return String(highestReceiptNumber + 1);
};

export const resetReceiptSequenceForDemo = (_seq: number) => undefined;
