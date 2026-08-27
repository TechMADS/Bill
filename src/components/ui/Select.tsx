import React, { forwardRef } from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { label: string; value: string | number }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = "", ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>}
        <select
          ref={ref}
          className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-blue-500'} 
            ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";
