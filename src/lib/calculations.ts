import { Bill } from "./bills";
import { format, subDays } from "date-fns";

export const calculateTotalRevenue = (bills: Bill[]): number => {
  return bills.reduce((sum, b) => sum + b.amount, 0);
};

export const calculateCashRevenue = (bills: Bill[]): number => {
  return bills.filter(b => b.paymentMethod === "Cash").reduce((sum, b) => sum + b.amount, 0);
};

export const calculateUPIRevenue = (bills: Bill[]): number => {
  return bills.filter(b => b.paymentMethod === "UPI").reduce((sum, b) => sum + b.amount, 0);
};

export const calculateAverageBillValue = (bills: Bill[]): number => {
  if (bills.length === 0) return 0;
  return calculateTotalRevenue(bills) / bills.length;
};

export const calculateDailyRevenue = (bills: Bill[], dateStr: string): number => {
  return bills
    .filter(b => format(new Date(b.date), "yyyy-MM-dd") === dateStr)
    .reduce((sum, b) => sum + b.amount, 0);
};

export const calculateRevenueLast7Days = (bills: Bill[]) => {
  return Array.from({ length: 7 }).map((_, i) => {
    const date = subDays(new Date(), 6 - i);
    const dateStr = format(date, "MMM dd");
    const dayBills = bills.filter(b => {
      try {
        return format(new Date(b.date), "MMM dd") === dateStr;
      } catch {
        return false;
      }
    });
    return {
      name: dateStr,
      revenue: dayBills.reduce((sum, b) => sum + b.amount, 0)
    };
  });
};
