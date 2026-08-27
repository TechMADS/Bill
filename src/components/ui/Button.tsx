import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

export function Button({ variant = "primary", size = "md", icon, className = "", children, ...props }: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-500",
    danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 focus:ring-red-500",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100 shadow-none hover:text-slate-900 focus:ring-slate-500"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
}
