import { v4 as uuidv4 } from "uuid";
import { Bill, saveBills, resetReceiptSequenceForDemo } from "./bills";
import { Customer, saveCustomers } from "./customers";
import { subDays, format } from "date-fns";
import { numberToWords } from "./numberToWords";

export const loadDemoData = () => {
  const customers: Customer[] = [
    { id: uuidv4(), name: "Tech Solutions Inc", phone: "9876543210", totalBills: 3, totalPaid: 45000, lastPaymentDate: format(new Date(), "yyyy-MM-dd") },
    { id: uuidv4(), name: "Global Exports", phone: "8765432109", totalBills: 2, totalPaid: 12000, lastPaymentDate: format(subDays(new Date(), 2), "yyyy-MM-dd") },
    { id: uuidv4(), name: "Sarah Jenkins", phone: "7654321098", totalBills: 1, totalPaid: 5500, lastPaymentDate: format(subDays(new Date(), 4), "yyyy-MM-dd") },
    { id: uuidv4(), name: "Pioneer Group", phone: "6543210987", totalBills: 2, totalPaid: 28000, lastPaymentDate: format(subDays(new Date(), 1), "yyyy-MM-dd") },
    { id: uuidv4(), name: "Michael Chang", phone: "5432109876", totalBills: 2, totalPaid: 8500, lastPaymentDate: format(subDays(new Date(), 5), "yyyy-MM-dd") }
  ];

  const bills: Bill[] = [
    {
      id: uuidv4(), receiptNumber: "REC-000001", date: format(subDays(new Date(), 6), "yyyy-MM-dd"),
      customerName: "Global Exports", customerPhone: "8765432109", paymentReceivedBy: "Admin", amount: 4000,
      paymentMethod: "Cash", amountInWords: numberToWords(4000), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(), receiptNumber: "REC-000002", date: format(subDays(new Date(), 5), "yyyy-MM-dd"),
      customerName: "Michael Chang", customerPhone: "5432109876", paymentReceivedBy: "Admin", amount: 5000,
      paymentMethod: "UPI", upiTransactionId: "UPI987654321", amountInWords: numberToWords(5000), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(), receiptNumber: "REC-000003", date: format(subDays(new Date(), 4), "yyyy-MM-dd"),
      customerName: "Sarah Jenkins", customerPhone: "7654321098", paymentReceivedBy: "Admin", amount: 5500,
      paymentMethod: "UPI", upiTransactionId: "UPI876543210", amountInWords: numberToWords(5500), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(), receiptNumber: "REC-000004", date: format(subDays(new Date(), 3), "yyyy-MM-dd"),
      customerName: "Tech Solutions Inc", customerPhone: "9876543210", paymentReceivedBy: "Admin", amount: 15000,
      paymentMethod: "Cash", amountInWords: numberToWords(15000), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(), receiptNumber: "REC-000005", date: format(subDays(new Date(), 2), "yyyy-MM-dd"),
      customerName: "Tech Solutions Inc", customerPhone: "9876543210", paymentReceivedBy: "Admin", amount: 10000,
      paymentMethod: "UPI", upiTransactionId: "UPI765432109", amountInWords: numberToWords(10000), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(), receiptNumber: "REC-000006", date: format(subDays(new Date(), 2), "yyyy-MM-dd"),
      customerName: "Global Exports", customerPhone: "8765432109", paymentReceivedBy: "Admin", amount: 8000,
      paymentMethod: "UPI", upiTransactionId: "UPI654321098", amountInWords: numberToWords(8000), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(), receiptNumber: "REC-000007", date: format(subDays(new Date(), 1), "yyyy-MM-dd"),
      customerName: "Pioneer Group", customerPhone: "6543210987", paymentReceivedBy: "Admin", amount: 18000,
      paymentMethod: "Cash", amountInWords: numberToWords(18000), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(), receiptNumber: "REC-000008", date: format(subDays(new Date(), 1), "yyyy-MM-dd"),
      customerName: "Michael Chang", customerPhone: "5432109876", paymentReceivedBy: "Admin", amount: 3500,
      paymentMethod: "Cash", amountInWords: numberToWords(3500), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(), receiptNumber: "REC-000009", date: format(new Date(), "yyyy-MM-dd"),
      customerName: "Pioneer Group", customerPhone: "6543210987", paymentReceivedBy: "Admin", amount: 10000,
      paymentMethod: "UPI", upiTransactionId: "UPI543210987", amountInWords: numberToWords(10000), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(), receiptNumber: "REC-000010", date: format(new Date(), "yyyy-MM-dd"),
      customerName: "Tech Solutions Inc", customerPhone: "9876543210", paymentReceivedBy: "Admin", amount: 20000,
      paymentMethod: "UPI", upiTransactionId: "UPI432109876", amountInWords: numberToWords(20000), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    }
  ];

  // Bills are usually sorted newest first
  saveBills(bills.reverse());
  saveCustomers(customers);
  resetReceiptSequenceForDemo(10);
};
