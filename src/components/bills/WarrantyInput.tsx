"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";

const warrantyOptions = [
  "1 Month",
  "2 Months",
  "3 Months",
  "4 Months",
  "5 Months",
  "6 Months",
  "1 Year",
  "2 Years",
];

interface WarrantyInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function WarrantyInput({ value, onChange }: WarrantyInputProps) {
  const inputId = useId();
  const listId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const matchingOptions = warrantyOptions.filter(option =>
    option.toLowerCase().includes(value.trim().toLowerCase())
  );

  return (
    <div
      className="relative w-full"
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsOpen(false);
        }
      }}
    >
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-slate-700">
        Warranty
      </label>
      <div className="relative">
        <input
          id={inputId}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={listId}
          value={value}
          onChange={event => onChange(event.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={event => {
            if (event.key === "ArrowDown") setIsOpen(true);
            if (event.key === "Escape") setIsOpen(false);
          }}
          placeholder="Select or type warranty"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 pr-10 text-sm text-slate-800 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          type="button"
          aria-label={isOpen ? "Hide warranty options" : "Show warranty options"}
          aria-expanded={isOpen}
          onMouseDown={event => event.preventDefault()}
          onClick={() => setIsOpen(open => !open)}
          className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-500 hover:text-slate-700 focus:outline-none focus:ring-1 focus:ring-inset focus:ring-blue-500"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
      </div>
      {isOpen && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Warranty options"
          className="absolute z-20 mt-1 w-full rounded-md border border-slate-200 bg-white py-1 shadow-lg"
        >
          {matchingOptions.length > 0 ? matchingOptions.map(option => (
            <li key={option} role="option" aria-selected={value === option}>
              <button
                type="button"
                onMouseDown={event => event.preventDefault()}
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 focus:bg-slate-50 focus:outline-none"
              >
                {option}
              </button>
            </li>
          )) : (
            <li className="px-3 py-2 text-sm text-slate-500">
              No matching options. Your custom value will be saved.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}