import React from "react";
import { Customer } from "@/lib/customers";
import { Mail, Phone } from "lucide-react";

interface CustomerTableProps {
  customers: Customer[];
  currencySymbol: string;
}

export function CustomerTable({ customers, currencySymbol }: CustomerTableProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {customers.length > 0 ? customers.map((customer) => (
        <div key={customer.id} className="border rounded-xl p-5 hover:shadow-md transition-shadow bg-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-slate-800">{customer.name}</h3>
              <p className="text-xs font-medium text-blue-600">
                Total Paid: {currencySymbol}{customer.totalPaid.toFixed(2)}
              </p>
            </div>
          </div>
          
          <div className="space-y-2 text-sm text-slate-600 mt-4 pt-4 border-t border-slate-100">
            {customer.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                <span>{customer.phone}</span>
              </div>
            )}
            <div className="flex justify-between items-center mt-2 text-xs text-slate-500">
              <span>Total Bills: {customer.totalBills}</span>
              {customer.lastPaymentDate && <span>Last: {customer.lastPaymentDate}</span>}
            </div>
          </div>
        </div>
      )) : (
        <div className="col-span-full text-center py-12 text-slate-500">
          No customers found. Create a receipt for a new customer to add them to this list.
        </div>
      )}
    </div>
  );
}
