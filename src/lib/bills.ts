import { getData, storeData } from "./storage";

export type PaymentMethod = "Cash" | "UPI";

export interface Bill {
  id: string;
  receiptNumber: string;
  date: string;
  customerName: string;
  customerPhone: string;
  paymentReceivedBy: string;
  amount: number;
  paymentMethod: PaymentMethod;
  upiTransactionId?: string;
  amountInWords: string;
  createdAt: string;
  updatedAt: string;
}

export const getBills = (): Bill[] => getData("bills_v3", []);
export const saveBills = (bills: Bill[]) => storeData("bills_v3", bills);

export const getNextReceiptNumber = (): string => {
  const currentSequence = getData("receipt_sequence", 0);
  const nextSequence = currentSequence + 1;
  storeData("receipt_sequence", nextSequence);
  
  return `REC-${nextSequence.toString().padStart(6, '0')}`;
};

export const resetReceiptSequenceForDemo = (seq: number) => {
  storeData("receipt_sequence", seq);
}
