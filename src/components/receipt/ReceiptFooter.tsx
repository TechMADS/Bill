import React from "react";
import { Bill } from "@/lib/bills";

export function ReceiptFooter({ bill }: { bill: Bill }) {
  return (
    <div className="mt-auto border-t border-blue-100 pt-8">
      <div className="text-center text-sm text-slate-500">
        <p className="font-semibold text-slate-700">
          Thank you for your payment.
        </p>
        <p className="mt-1 text-xs">
          We appreciate your business.
        </p>
      </div>
    </div>
  );
}