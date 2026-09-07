"use client";

import { DollarSign, FileText, Users, Receipt } from "lucide-react";

import { useEffect, useState } from "react";
import { getBills, Bill } from "@/lib/bills";
import { deriveCustomers, Customer } from "@/lib/customers";
import { getSettings, BusinessSettings } from "@/lib/settings";
import { calculateTotalRevenue, calculateUPIRevenue, calculateRevenueLast7Days } from "@/lib/calculations";
import { format } from "date-fns";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentBills } from "@/components/dashboard/RecentBills";

export default function Dashboard() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    getBills()
      .then(fetchedBills => {
        setBills(fetchedBills);
        setCustomers(deriveCustomers(fetchedBills));
      })
      .catch(error => alert(error instanceof Error ? `Failed to fetch bills: ${error.message}` : "Failed to fetch bills"));
    setSettings(getSettings());
    setMounted(true);
  }, []);

  if (!mounted || !settings) return null;

  const totalRevenue = calculateTotalRevenue(bills);
  const totalUPI = calculateUPIRevenue(bills);
  const chartData = calculateRevenueLast7Days(bills);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        description={format(new Date(), "MMMM dd, yyyy")}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={<DollarSign className="h-6 w-6 text-green-600" />}
          trend="+12.5%"
          trendUp={true}
        />
        <StatCard
          title="Total UPI Payments"
          value={`₹${totalUPI.toLocaleString()}`}
          icon={<Receipt className="h-6 w-6 text-blue-600" />}
        />
        <StatCard
          title="Total Receipts"
          value={bills.length.toString()}
          icon={<FileText className="h-6 w-6 text-indigo-600" />}
        />
        <StatCard
          title="Total Customers"
          value={customers.length.toString()}
          icon={<Users className="h-6 w-6 text-purple-600" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueChart data={chartData} />
        <RecentBills bills={bills} currencySymbol="₹" />
      </div>
    </div>
  );
}
