import React from "react";
import { Bill } from "@/lib/bills";

export function ReceiptFooter({ bill }: { bill: Bill }) {
  return (
    <div className="border-t border-slate-200 pt-8 mt-auto">
      <div className="flex justify-between items-end">
        <div className="text-slate-400 text-xs">
          <p>Thank you for your business!</p>
          <p className="mt-1">Generated on {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
