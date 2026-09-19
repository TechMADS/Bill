import { Bill, BillFields, sourceFieldValue } from "./bills";

export type GstMode = "intra" | "inter";

export interface GstItem {
  description: string;
  hsnSac: string;
  quantity: number;
  unit: string;
  rate: number;
  gstRate: number;
}

export interface GstItemTotals extends GstItem {
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export interface GstTotals {
  items: GstItemTotals[];
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalGst: number;
  grandTotal: number;
}

const round = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

export const calculateGstTotals = (items: GstItem[], mode: GstMode): GstTotals => {
  const calculated = items.map(item => {
    const taxableValue = round(item.quantity * item.rate);
    const tax = round(taxableValue * item.gstRate / 100);
    const cgst = mode === "intra" ? round(tax / 2) : 0;
    const sgst = mode === "intra" ? round(tax - cgst) : 0;
    const igst = mode === "inter" ? tax : 0;
    return { ...item, taxableValue, cgst, sgst, igst, total: round(taxableValue + tax) };
  });
  const taxableValue = round(calculated.reduce((sum, item) => sum + item.taxableValue, 0));
  const cgst = round(calculated.reduce((sum, item) => sum + item.cgst, 0));
  const sgst = round(calculated.reduce((sum, item) => sum + item.sgst, 0));
  const igst = round(calculated.reduce((sum, item) => sum + item.igst, 0));
  const totalGst = round(cgst + sgst + igst);
  return { items: calculated, taxableValue, cgst, sgst, igst, totalGst, grandTotal: round(taxableValue + totalGst) };
};

export const gstField = (bill: Bill, names: string[]): string => sourceFieldValue(bill.fields ?? {}, names);

export const isGstBill = (bill: Bill): boolean => gstField(bill, ["Document Type", "Bill Type"]).toUpperCase() === "GST";

export const gstFields = (input: {
  supplierName: string;
  supplierGstin: string;
  receiptNumber: string;
  date: string;
  customerName: string;
  customerAddress: string;
  customerGstin: string;
  placeOfSupply: string;
  reverseCharge: boolean;
  paymentMethod: string;
  items: GstItemTotals[];
  totals: GstTotals;
  amountInWords: string;
  createdAt: string;
}): BillFields => ({
  "Document Type": "GST",
  "Bill Type": "GST",
  "Receipt Number": input.receiptNumber,
  "Supplier Name": input.supplierName,
  "Supplier GSTIN": input.supplierGstin,
  "Invoice Date": input.date,
  "Date": input.date,
  "Customer Name": input.customerName,
  "Customer Address": input.customerAddress,
  "Customer GSTIN": input.customerGstin,
  "Place of Supply": input.placeOfSupply,
  "Reverse Charge": input.reverseCharge ? "Yes" : "No",
  "Payment Method": input.paymentMethod,
  "Items": JSON.stringify(input.items),
  "Total Taxable Value": input.totals.taxableValue.toFixed(2),
  "CGST": input.totals.cgst.toFixed(2),
  "SGST": input.totals.sgst.toFixed(2),
  "IGST": input.totals.igst.toFixed(2),
  "Total GST": input.totals.totalGst.toFixed(2),
  "Amount": input.totals.grandTotal.toFixed(2),
  "Grand Total": input.totals.grandTotal.toFixed(2),
  "Amount in Words": input.amountInWords,
  "Created At": input.createdAt,
  "Updated At": input.createdAt,
});

export const gstItemsFromBill = (bill: Bill): GstItemTotals[] => {
  try {
    const parsed = JSON.parse(gstField(bill, ["Items"]));
    return Array.isArray(parsed) ? parsed as GstItemTotals[] : [];
  } catch {
    return [];
  }
};