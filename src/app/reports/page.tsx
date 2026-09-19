"use client";

import { useState, useEffect } from "react";
import { getBills, Bill } from "@/lib/bills";
import { isGstBill } from "@/lib/gst";
import { calculateTotalRevenue, calculateUPIRevenue, calculateCashRevenue, calculateRevenueLast7Days } from "@/lib/calculations";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Loading } from "@/components/ui/Loading";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { formatCurrency } from "@/lib/numberToWords";

export default function Reports() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getBills()
      .then(bills => setBills(bills.filter(bill => !isGstBill(bill))))
      .catch(error => setError(error instanceof Error ? error.message : "Failed to fetch report data"))
      .finally(() => {
        setLoading(false);
        setMounted(true);
      });
  }, []);

  if (!mounted || loading) return <Loading text="Loading reports from Google Sheets..." />;
  if (error) return <EmptyState title="Unable to load reports" description={error} />;

  const totalRevenue = calculateTotalRevenue(bills);
  const totalUPI = calculateUPIRevenue(bills);
  const totalCash = calculateCashRevenue(bills);

  // Status Data for Pie Chart
  const statusData = [
    { name: "Cash", value: totalCash, color: "#10b981" },
    { name: "UPI", value: totalUPI, color: "#3b82f6" }
  ].filter(d => d.value > 0);

  // Revenue by Day for Line Chart (Last 7 Days)
  const revenueData = calculateRevenueLast7Days(bills);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <PageHeader title="Financial Reports" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Collected"
          value={formatCurrency(totalRevenue)}
          icon={<span className="font-bold text-slate-700">₹</span>}
        />
        <StatCard
          title="UPI Payments"
          value={formatCurrency(totalUPI)}
          icon={<span className="font-bold text-blue-600">₹</span>}
        />
        <StatCard
          title="Cash Payments"
          value={formatCurrency(totalCash)}
          icon={<span className="font-bold text-green-600">₹</span>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueChart data={revenueData} />

        <Card>
          <CardHeader title="Payment Methods" />
          <CardContent className="flex flex-col h-full">
            <div className="h-72 w-full flex-1">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value: any) => [formatCurrency(Number(value)), 'Amount']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                  No payment data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
