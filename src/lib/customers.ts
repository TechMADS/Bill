import { billCreatedAt, Bill } from "./bills";

export const formatCustomerLastPaymentDate = (value: string): string => {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

export interface Customer {
  id: string;
  name: string;
  phone: string;
  totalBills: number;
  totalPaid: number;
  lastPaymentDate?: string;
}

export const deriveCustomers = (bills: Bill[]): Customer[] => {
  const customers = new Map<string, Customer>();
  const latestActivity = new Map<string, number>();

  for (const bill of bills) {
    const name = bill.customerName.trim();
    const phone = bill.customerPhone.trim();
    const key = `${name.toLowerCase()}|${phone}`;
    const existing = customers.get(key);
    const activity = billCreatedAt(bill);
    const previousActivity = latestActivity.get(key) ?? 0;
    latestActivity.set(key, Math.max(latestActivity.get(key) ?? 0, activity));

    if (existing) {
      existing.totalBills += 1;
      existing.totalPaid += bill.amount;
      if (activity >= previousActivity) {
        existing.lastPaymentDate = bill.createdAt || bill.date;
      }
    } else {
      customers.set(key, {
        id: `customer-${customers.size + 1}`,
        name,
        phone,
        totalBills: 1,
        totalPaid: bill.amount,
        lastPaymentDate: bill.createdAt || bill.date,
      });
    }
  }

  return Array.from(customers.entries())
    .sort(([keyA], [keyB]) => (latestActivity.get(keyB) ?? 0) - (latestActivity.get(keyA) ?? 0))
    .map(([, customer]) => customer);
};
