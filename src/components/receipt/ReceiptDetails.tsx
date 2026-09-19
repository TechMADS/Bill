import React from "react";
import { Bill } from "@/lib/bills";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/numberToWords";

interface ReceiptDetailsProps {
  bill: Bill;
}

export function ReceiptDetails({ bill }: ReceiptDetailsProps) {
  return (
    <div className="space-y-8 mb-12">
      <div className="grid grid-cols-2 gap-8 text-sm">
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-slate-400 uppercase tracking-wider mb-1 text-xs">Receipt No</h3>
            <p className="font-semibold text-slate-800 text-lg">{bill.receiptNumber}</p>
          </div>
          <div>
            <h3 className="font-bold text-slate-400 uppercase tracking-wider mb-1 text-xs">Received From</h3>
            <p className="font-semibold text-slate-800 text-lg">{bill.customerName}</p>
            {bill.customerPhone && <p className="text-slate-600 mt-1">{bill.customerPhone}</p>}
          </div>
        </div>

        <div className="space-y-4 text-right">
          <div>
            <h3 className="font-bold text-slate-400 uppercase tracking-wider mb-1 text-xs">Date</h3>
            <p className="font-semibold text-slate-800 text-lg">{format(new Date(bill.date), 'MMM dd, yyyy')}</p>
          </div>
          <div>
            <h3 className="font-bold text-slate-400 uppercase tracking-wider mb-1 text-xs">Amount</h3>
            <p className="font-bold text-blue-700 text-2xl">{formatCurrency(bill.amount)}</p>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-lg border border-slate-100">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500 block mb-1">Amount in Words</span>
            <span className="font-medium text-slate-800 italic">{bill.amountInWords}</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-1">Payment Method</span>
            <div className="font-medium text-slate-800">
              {bill.paymentMethod}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
