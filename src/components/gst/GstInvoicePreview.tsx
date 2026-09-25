import React, { forwardRef } from "react";
import { format } from "date-fns";
import { Bill } from "@/lib/bills";
import { BusinessSettings } from "@/lib/settings";
import { formatCurrency } from "@/lib/numberToWords";
import { gstField, gstItemsFromBill } from "@/lib/gst";

interface GstInvoicePreviewProps {
  bill: Bill;
  settings: BusinessSettings;
}

const displayDate = (value: string): string => {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : format(date, "dd MMM yyyy");
};

export const GstInvoicePreview = forwardRef<HTMLDivElement, GstInvoicePreviewProps>(({ bill, settings }, ref) => {
  const items = gstItemsFromBill(bill);
  const customerAddress = gstField(bill, ["Customer Address"]);
  const customerPhone = gstField(bill, ["Customer Phone"]);
  const placeOfSupply = gstField(bill, ["Place of Supply"]);
  const paymentReceivedBy = gstField(bill, ["Payment Received By Number"]) || "Admin";
  const taxableValue = Number(gstField(bill, ["Total Taxable Value"])) || 0;
  const cgst = Number(gstField(bill, ["CGST"])) || 0;
  const sgst = Number(gstField(bill, ["SGST"])) || 0;
  const igst = Number(gstField(bill, ["IGST"])) || 0;
  const totalGst = Number(gstField(bill, ["Total GST"])) || cgst + sgst + igst;

  return (
    <div className="print-receipt flex w-full justify-start overflow-x-auto bg-slate-200 p-2 sm:justify-center sm:p-4 md:p-8 print:bg-white print:p-0">
      <div ref={ref} className="min-w-[720px] max-w-[900px] bg-white p-4 text-slate-800 shadow-lg print:shadow-none sm:p-8 md:p-12">
        <div className="border-b-2 border-slate-800 pb-5 text-center">
          <p className="text-sm font-semibold tracking-[0.25em] text-slate-500">TAX INVOICE</p>
          <h1 className="mt-2 text-2xl font-bold uppercase">{settings.businessLegalName || settings.businessName}</h1>
          <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{settings.address}</p>
          {settings.email && <p className="text-sm text-slate-600">{settings.email}</p>}
          {settings.gstNumber && <p className="mt-1 text-sm font-semibold">GSTIN: {settings.gstNumber}</p>}
          {settings.state && <p className="mt-1 text-sm text-slate-600">State: {settings.state}</p>}
        </div>

        <div className="grid grid-cols-2 gap-6 border-b border-slate-300 py-5 text-sm">
          <div>
            <p className="font-semibold uppercase text-slate-500">Bill To</p>
            <p className="mt-2 text-base font-bold">{bill.customerName}</p>
            {customerPhone && <p className="text-slate-600">Phone: {customerPhone}</p>}
            {customerAddress && <p className="whitespace-pre-line text-slate-600">{customerAddress}</p>}
            {placeOfSupply && <p className="mt-1 text-slate-600">Place of Supply: {placeOfSupply}</p>}
          </div>
          <div className="text-right">
            <p><span className="font-semibold">Invoice No:</span> {bill.receiptNumber}</p>
            <p className="mt-1"><span className="font-semibold">Invoice Date:</span> {displayDate(gstField(bill, ["Invoice Date", "Date"]))}</p>
            <p className="mt-1"><span className="font-semibold">Payment:</span> {gstField(bill, ["Payment Method"]) || bill.paymentMethod}</p>
            <p className="mt-1"><span className="font-semibold">Payment Received By Number:</span> {paymentReceivedBy}</p>
          </div>
        </div>

        <table className="mt-6 w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100 text-left">
              <th className="border border-slate-300 p-2">#</th>
              <th className="border border-slate-300 p-2">Description</th>
              <th className="border border-slate-300 p-2">HSN/SAC</th>
              <th className="border border-slate-300 p-2 text-right">Qty</th>
              <th className="border border-slate-300 p-2 text-right">Rate</th>
              <th className="border border-slate-300 p-2 text-right">Taxable</th>
              <th className="border border-slate-300 p-2 text-right">GST %</th>
              <th className="border border-slate-300 p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={`${item.description}-${index}`}>
                <td className="border border-slate-300 p-2">{index + 1}</td>
                <td className="border border-slate-300 p-2">{item.description}</td>
                <td className="border border-slate-300 p-2">{item.hsnSac}</td>
                <td className="border border-slate-300 p-2 text-right">{item.quantity} {item.unit}</td>
                <td className="border border-slate-300 p-2 text-right">{formatCurrency(item.rate)}</td>
                <td className="border border-slate-300 p-2 text-right">{formatCurrency(item.taxableValue)}</td>
                <td className="border border-slate-300 p-2 text-right">{item.gstRate}%</td>
                <td className="border border-slate-300 p-2 text-right">{formatCurrency(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 grid grid-cols-2 gap-8 text-sm">
          <div>
            <p className="font-semibold">Amount in Words</p>
            <p className="mt-1 italic text-slate-600">{gstField(bill, ["Amount in Words"])}</p>
            {(settings.bankName || settings.accountNumber || settings.ifsc) && (
              <div className="mt-6 border-t border-slate-200 pt-4">
                <p className="font-semibold">Bank Details</p>
                {settings.bankName && <p>Bank: {settings.bankName}</p>}
                {settings.accountNumber && <p>Account: {settings.accountNumber}</p>}
                {settings.ifsc && <p>IFSC: {settings.ifsc}</p>}
              </div>
            )}
          </div>
          <div className="space-y-2 text-right">
            <div className="flex justify-between"><span>Total Taxable Value</span><strong>{formatCurrency(taxableValue)}</strong></div>
            {cgst > 0 && <div className="flex justify-between"><span>CGST</span><strong>{formatCurrency(cgst)}</strong></div>}
            {sgst > 0 && <div className="flex justify-between"><span>SGST</span><strong>{formatCurrency(sgst)}</strong></div>}
            {igst > 0 && <div className="flex justify-between"><span>IGST</span><strong>{formatCurrency(igst)}</strong></div>}
            <div className="flex justify-between border-t-2 border-slate-800 pt-2 text-lg"><span>Grand Total</span><strong>{formatCurrency(bill.amount)}</strong></div>
            <p className="text-xs text-slate-500">Total GST: {formatCurrency(totalGst)}</p>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-300 pt-5 text-sm text-center">
          <div className="mx-auto max-w-2xl text-slate-500">
            <p className="font-semibold text-slate-700">Declaration</p>
            <p className="mt-1">
              This is a GST-style tax invoice generated by the billing application.
              It is not an official e-invoice and does not contain an IRN or
              government verification.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});
GstInvoicePreview.displayName = "GstInvoicePreview";
