import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-500 transition-colors
              ${icon ? 'pl-9' : ''} 
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-blue-500'} 
              ${className}`}
            {...props}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
