"use client";

import { Banknote, FileText, Users, Receipt } from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { billDateKey, getBills, Bill, sortBillsNewestFirst } from "@/lib/bills";
import { isGstBill } from "@/lib/gst";
import { deriveCustomers } from "@/lib/customers";
import { getSettings, BusinessSettings } from "@/lib/settings";
import { calculateRevenueLast7Days } from "@/lib/calculations";
import { formatCurrency } from "@/lib/numberToWords";
import { format } from "date-fns";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentBills } from "@/components/dashboard/RecentBills";

export default function Dashboard() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [mounted, setMounted] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const loadBills = () => getBills()
      .then(fetchedBills => {
        setBills(fetchedBills.filter(bill => !isGstBill(bill)));
      })
      .catch(error => alert(error instanceof Error ? `Failed to fetch bills: ${error.message}` : "Failed to fetch bills"));

    const refreshBills = () => {
      void loadBills();
    };

    void loadBills();
    window.addEventListener("bill:created", refreshBills);
    window.addEventListener("focus", refreshBills);
    setSettings(getSettings());
    setMounted(true);

    return () => {
      window.removeEventListener("bill:created", refreshBills);
      window.removeEventListener("focus", refreshBills);
    };
  }, []);

  const sortedBills = useMemo(() => sortBillsNewestFirst(bills), [bills]);
  const visibleBills = useMemo(
    () => selectedDate ? sortedBills.filter(bill => billDateKey(bill.date) === selectedDate) : sortedBills,
    [selectedDate, sortedBills]
  );
  const dashboardMetrics = useMemo(() => {
    const todayKey = format(new Date(), "yyyy-MM-dd");
    const monthKey = todayKey.slice(0, 7);
    let totalRevenue = 0;
    let totalCash = 0;
    let totalUPI = 0;
    let todayRevenue = 0;
    let monthlyRevenue = 0;

    for (const bill of visibleBills) {
      totalRevenue += bill.amount;
      if (bill.paymentMethod === "Cash") totalCash += bill.amount;
      if (bill.paymentMethod === "UPI") totalUPI += bill.amount;
      const dateKey = billDateKey(bill.date);
      if (dateKey === todayKey) todayRevenue += bill.amount;
      if (dateKey.startsWith(monthKey)) monthlyRevenue += bill.amount;
    }

    return {
      totalRevenue,
      totalCash,
      totalUPI,
      averageBillValue: visibleBills.length ? totalRevenue / visibleBills.length : 0,
      todayRevenue,
      monthlyRevenue,
      visibleCustomers: deriveCustomers(visibleBills),
      chartData: calculateRevenueLast7Days(visibleBills),
    };
  }, [visibleBills]);

  if (!mounted || !settings) return null;

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        description={format(new Date(), "MMMM dd, yyyy")}
      />

      <div className="flex items-center gap-3">
        <label htmlFor="dashboard-date" className="text-sm font-medium text-slate-700">Date</label>
        <input id="dashboard-date" type="date" value={selectedDate} onChange={event => setSelectedDate(event.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
        {selectedDate && <button type="button" onClick={() => setSelectedDate("")} className="text-sm text-blue-600 hover:underline">Clear</button>}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(dashboardMetrics.totalRevenue)}
          icon={<Banknote className="h-6 w-6 text-green-600" />}
        />
        <StatCard
          title="Cash Revenue"
          value={formatCurrency(dashboardMetrics.totalCash)}
          icon={<Receipt className="h-6 w-6 text-blue-600" />}
        />
        <StatCard
          title="UPI Revenue"
          value={formatCurrency(dashboardMetrics.totalUPI)}
          icon={<FileText className="h-6 w-6 text-indigo-600" />}
        />
        <StatCard
          title="Total Bills"
          value={visibleBills.length.toString()}
          icon={<Users className="h-6 w-6 text-purple-600" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
        <StatCard title="Average Bill Value" value={formatCurrency(dashboardMetrics.averageBillValue)} icon={<Receipt className="h-6 w-6 text-blue-600" />} />
        <StatCard title="Total Customers" value={dashboardMetrics.visibleCustomers.length.toString()} icon={<Users className="h-6 w-6 text-purple-600" />} />
        <StatCard title="Today's Revenue" value={formatCurrency(dashboardMetrics.todayRevenue)} icon={<Banknote className="h-6 w-6 text-green-600" />} />
        <StatCard title="Monthly Revenue" value={formatCurrency(dashboardMetrics.monthlyRevenue)} icon={<Banknote className="h-6 w-6 text-blue-600" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueChart data={dashboardMetrics.chartData} />
        <RecentBills bills={visibleBills} />
      </div>
    </div>
  );
}
