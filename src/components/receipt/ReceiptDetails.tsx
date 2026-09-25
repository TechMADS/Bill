import React from "react";
import { Bill } from "@/lib/bills";
import { BusinessSettings } from "@/lib/settings";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/numberToWords";

interface ReceiptDetailsProps {
  bill: Bill;
  settings: BusinessSettings;
}

const fieldValue = (bill: Bill, names: string[]): string => {
  const normalizedNames = names.map(name => name.toLowerCase().replace(/[^a-z0-9]/g, ""));
  const key = Object.keys(bill.fields ?? {}).find(field => normalizedNames.includes(field.toLowerCase().replace(/[^a-z0-9]/g, "")));
  return key ? bill.fields?.[key] ?? "" : "";
};

export function ReceiptDetails({ bill, settings }: ReceiptDetailsProps) {
  const receiverName = fieldValue(bill, ["Payment Received By Number"]) || settings.defaultReceiverName;
  const upiReference = bill.paymentMethod === "UPI"
    ? fieldValue(bill, ["UPI Transaction ID", "UPI Reference ID", "Transaction ID", "Reference ID"])
    : "";

  return (
    <div className="mb-10 space-y-6">
      <div className="grid grid-cols-1 gap-5 rounded-lg border border-blue-100 bg-blue-50/50 p-5 sm:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Receipt</p>
          <p className="mt-2 text-xl font-bold text-slate-900">{bill.receiptNumber}</p>
        </div>
        <div className="sm:text-right">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Date</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{format(new Date(bill.date), "MMM dd, yyyy")}</p>
        </div>
      </div>

      <section className="border-b border-slate-200 pb-6">
        <h3 className="border-b border-slate-200 pb-3 text-xs font-bold uppercase tracking-[0.18em] text-blue-800">Customer Details</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div><p className="text-slate-500">Customer Name</p><p className="mt-1 text-base font-semibold text-slate-900">{bill.customerName}</p></div>
          <div><p className="text-slate-500">Customer Phone</p><p className="mt-1 text-base font-semibold text-slate-900">{bill.customerPhone || "-"}</p></div>
        </div>
      </section>

      <section className="border-b border-slate-200 pb-6">
        <h3 className="border-b border-slate-200 pb-3 text-xs font-bold uppercase tracking-[0.18em] text-blue-800">Payment Details</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div><p className="text-slate-500">Payment Received By Number</p><p className="mt-1 font-semibold text-slate-900">{bill.paymentReceivedBy || receiverName || "-"}</p></div>
          <div><p className="text-slate-500">Payment Method</p><p className="mt-1 font-semibold text-slate-900">{bill.paymentMethod}</p></div>
          {upiReference && <div><p className="text-slate-500">UPI Reference ID</p><p className="mt-1 break-all font-semibold text-slate-900">{upiReference}</p></div>}
        </div>
      </section>

      <section className="rounded-lg border-2 border-blue-100 bg-blue-50/50 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Amount Paid</p>
            <p className="mt-2 text-3xl font-extrabold text-blue-900 sm:text-4xl">{formatCurrency(bill.amount)}</p>
          </div>
          <div className="sm:max-w-[55%] sm:text-right">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Amount in Words</p>
            <p className="mt-2 text-sm font-medium italic text-slate-700">{bill.amountInWords || "-"}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
