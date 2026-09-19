import React from "react";
import { Bill } from "@/lib/bills";
import { Card, CardHeader, CardContent } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { formatCurrency } from "@/lib/numberToWords";

interface RecentBillsProps {
  bills: Bill[];
}

export function RecentBills({ bills }: RecentBillsProps) {
  return (
    <Card>
      <CardHeader title="Recent Activity" />
      <CardContent>
        <div className="space-y-4">
          {bills.slice(0, 5).map((bill) => (
            <div key={bill.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
              <div>
                <p className="text-sm font-medium text-slate-800">{bill.customerName}</p>
                <p className="text-xs text-slate-500">Receipt {bill.receiptNumber}</p>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <p className="text-sm font-bold text-slate-800">{formatCurrency(bill.amount)}</p>
                <Badge variant={bill.paymentMethod === "UPI" ? "primary" : "neutral"}>
                  {bill.paymentMethod}
                </Badge>
              </div>
            </div>
          ))}
          {bills.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">
              No recent activity. Create a receipt to see it here.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
