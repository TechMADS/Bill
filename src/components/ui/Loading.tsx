import React from "react";
import { Loader2 } from "lucide-react";

export function Loading({ text = "Loading...", className = "" }: { text?: string, className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-slate-500 ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-600" />
      <p className="text-sm font-medium">{text}</p>
    </div>
  );
}
