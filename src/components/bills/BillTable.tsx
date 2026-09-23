import React from "react";
import { Bill } from "@/lib/bills";
import { format } from "date-fns";
import Link from "next/link";
import { Download, Eye } from "lucide-react";
import { Badge } from "../ui/Badge";
import { formatCurrency } from "@/lib/numberToWords";

interface BillTableProps {
  bills: Bill[];
}

export function BillTable({ bills }: BillTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-[680px] w-full text-left text-sm">
        <thead className="bg-white text-slate-600 border-b">
          <tr>
            <th className="px-6 py-4 font-semibold">Receipt No.</th>
            <th className="px-6 py-4 font-semibold">Date</th>
            <th className="px-6 py-4 font-semibold">Customer</th>
            <th className="px-6 py-4 font-semibold">Payment Method</th>
            <th className="px-6 py-4 font-semibold text-right">Amount</th>
            <th className="px-6 py-4 font-semibold text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {bills.length > 0 ? (
            bills.map((bill) => (
              <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 font-medium text-blue-600">{bill.receiptNumber}</td>
                <td className="px-6 py-4 text-slate-600">{format(new Date(bill.date), 'MMM dd, yyyy')}</td>
                <td className="px-6 py-4 font-medium text-slate-800">{bill.customerName}</td>
                <td className="px-6 py-4">
                  <Badge variant={bill.paymentMethod === "UPI" ? "primary" : "neutral"}>
                    {bill.paymentMethod}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-right font-medium text-slate-800">
                  {formatCurrency(bill.amount)}
                </td>
                <td className="px-6 py-4 text-center">
                  <Link href={`/bills/${bill.id}`} className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Eye className="h-5 w-5" />
                  </Link>
                  <Link href={`/bills/${bill.id}?download=1`} aria-label={`Download ${bill.receiptNumber} PDF`} className="inline-flex items-center justify-center p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Download className="h-5 w-5" />
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                No receipts found matching your criteria.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
