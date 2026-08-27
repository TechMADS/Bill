import React from "react";

export function Card({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`rounded-xl border bg-white shadow-sm overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, children, className = "" }: { title?: string, children?: React.ReactNode, className?: string }) {
  return (
    <div className={`p-4 md:p-6 border-b border-slate-100 ${className}`}>
      {title && <h2 className="text-lg font-semibold text-slate-800">{title}</h2>}
      {children}
    </div>
  );
}

export function CardContent({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`p-4 md:p-6 ${className}`}>
      {children}
    </div>
  );
}
