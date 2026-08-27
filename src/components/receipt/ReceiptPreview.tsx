import React, { forwardRef } from "react";
import { Bill } from "@/lib/bills";
import { BusinessSettings } from "@/lib/settings";
import { ReceiptHeader } from "./ReceiptHeader";
import { ReceiptDetails } from "./ReceiptDetails";
import { ReceiptFooter } from "./ReceiptFooter";

interface ReceiptPreviewProps {
  bill: Bill;
  settings: BusinessSettings;
}

export const ReceiptPreview = forwardRef<HTMLDivElement, ReceiptPreviewProps>(
  ({ bill, settings }, ref) => {
    return (
      <div className="bg-slate-200 p-4 md:p-8 rounded-xl flex justify-center print:bg-white print:p-0 w-full overflow-x-auto">
        <div 
          ref={ref} 
          className="bg-white w-full min-w-[600px] max-w-[800px] shadow-lg print:shadow-none p-8 md:p-14 text-slate-800 flex flex-col"
          style={{ minHeight: "800px" }}
        >
          <ReceiptHeader settings={settings} />
          <ReceiptDetails bill={bill} />
          <ReceiptFooter bill={bill} />
        </div>
      </div>
    );
  }
);
ReceiptPreview.displayName = "ReceiptPreview";
