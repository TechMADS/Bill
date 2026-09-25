
import React from "react";
import { BusinessSettings } from "@/lib/settings";

interface ReceiptHeaderProps {
  settings: BusinessSettings;
}

export function ReceiptHeader({ settings }: ReceiptHeaderProps) {
  return (
    <div className="mb-7 border-b-2 border-blue-900 pb-5">
      <div className="text-center">
        {/* Business Name */}
        <h2 className="break-words text-2xl font-extrabold uppercase tracking-tight text-blue-900 sm:text-3xl">
          {settings.businessName}
        </h2>

        {/* Business Address */}
        <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
          {settings.address}
        </p>
      </div>
    </div>
  );
}

