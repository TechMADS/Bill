import React from "react";
import { Search, Filter } from "lucide-react";
import { PaymentMethod } from "@/lib/bills";

interface BillFiltersProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  methodFilter: PaymentMethod | "All";
  onMethodFilterChange: (val: PaymentMethod | "All") => void;
}

export function BillFilters({ searchTerm, onSearchChange, methodFilter, onMethodFilterChange }: BillFiltersProps) {
  return (
    <div className="p-4 border-b flex flex-col sm:flex-row gap-4 justify-between bg-slate-50">
      <div className="relative w-full sm:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input 
          type="text"
          placeholder="Search by customer or receipt number..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
        />
      </div>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-slate-500" />
        <select 
          value={methodFilter}
          onChange={(e) => onMethodFilterChange(e.target.value as PaymentMethod | "All")}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
        >
          <option value="All">All Methods</option>
          <option value="Cash">Cash</option>
          <option value="UPI">UPI</option>
        </select>
      </div>
    </div>
  );
}
