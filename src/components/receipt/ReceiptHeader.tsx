import React from "react";
import { BusinessSettings } from "@/lib/settings";

export function ReceiptHeader({ settings }: { settings: BusinessSettings }) {
  return (
    <div className="flex justify-between items-start border-b-2 border-slate-200 pb-8 mb-8">
      <div>
        <h2 className="text-3xl font-bold text-blue-900 mb-2">{settings.businessName}</h2>
        <p className="text-sm text-slate-500 max-w-xs">{settings.address}</p>
        <p className="text-sm text-slate-500 mt-1">Phone: {settings.phone}</p>
        {settings.gstNumber && (
          <p className="text-sm text-slate-500 mt-1">GSTIN: {settings.gstNumber}</p>
        )}
      </div>
      <div className="text-right">
        <h1 className="text-4xl font-light text-slate-300 uppercase tracking-widest mb-4">Receipt</h1>
      </div>
    </div>
  );
}
