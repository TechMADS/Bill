import React from "react";
import { BusinessSettings } from "@/lib/settings";

export function ReceiptHeader({ settings }: { settings: BusinessSettings }) {
  return (
    <div className="flex flex-col gap-5 border-b-2 border-slate-200 pb-6 mb-6 sm:flex-row sm:items-start sm:justify-between sm:pb-8 sm:mb-8">
      <div className="min-w-0">
        <h2 className="break-words text-2xl font-bold text-blue-900 mb-2 sm:text-3xl">{settings.businessName}</h2>
        <p className="text-sm text-slate-500 max-w-xs">{settings.address}</p>
        <p className="text-sm text-slate-500 mt-1">Phone: {settings.phone}</p>
        {settings.gstNumber && (
          <p className="text-sm text-slate-500 mt-1">GSTIN: {settings.gstNumber}</p>
        )}
      </div>
      <div className="text-left sm:text-right">
        <h1 className="text-3xl font-light text-slate-300 uppercase tracking-widest sm:text-4xl">Receipt</h1>
      </div>
    </div>
  );
}
