import { getData, storeData } from "./storage";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  totalBills: number;
  totalPaid: number;
  lastPaymentDate?: string;
}

export const getCustomers = (): Customer[] => getData("customers_v3", []);
export const saveCustomers = (customers: Customer[]) => storeData("customers_v3", customers);
