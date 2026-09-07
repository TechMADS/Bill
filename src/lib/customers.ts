import { Bill } from "./bills";

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

  for (const bill of bills) {
    const name = bill.customerName.trim();
    const phone = bill.customerPhone.trim();
    const key = `${name.toLowerCase()}|${phone}`;
    const existing = customers.get(key);

    if (existing) {
      existing.totalBills += 1;
      existing.totalPaid += bill.amount;
      if (!existing.lastPaymentDate || bill.date > existing.lastPaymentDate) {
        existing.lastPaymentDate = bill.date;
      }
    } else {
      customers.set(key, {
        id: `customer-${customers.size + 1}`,
        name,
        phone,
        totalBills: 1,
        totalPaid: bill.amount,
        lastPaymentDate: bill.date,
      });
    }
  }

  return Array.from(customers.values()).sort((a, b) => a.name.localeCompare(b.name));
};
