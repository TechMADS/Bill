import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "neutral" | "primary";
  className?: string;
}

export function Badge({ children, variant = "neutral", className = "" }: BadgeProps) {
  const variants = {
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-700",
    neutral: "bg-slate-100 text-slate-700",
    primary: "bg-blue-100 text-blue-700"
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
