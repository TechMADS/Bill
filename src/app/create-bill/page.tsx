"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Bill, saveBills, getBills, getNextReceiptNumber, PaymentMethod } from "@/lib/bills";
import { getCustomers, Customer, saveCustomers } from "@/lib/customers";
import { getSettings } from "@/lib/settings";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { numberToWords } from "@/lib/numberToWords";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

export default function CreateBill() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [receiptNumber, setReceiptNumber] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  
  const [amount, setAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [upiTransactionId, setUpiTransactionId] = useState("");
  const [paymentReceivedBy, setPaymentReceivedBy] = useState("");
  const [amountInWords, setAmountInWords] = useState("");

  useEffect(() => {
    const s = getSettings();
    setPaymentReceivedBy(s.defaultReceiverName);
    
    setMounted(true);
  }, []);

  useEffect(() => {
    if (amount > 0) {
      setAmountInWords(numberToWords(amount));
    } else {
      setAmountInWords("");
    }
  }, [amount]);

  const handleSave = () => {
    if (!customerName || amount <= 0) {
      alert("Please enter customer name and valid amount");
      return;
    }

    const customers = getCustomers();
    let customer = customers.find(c => c.name.toLowerCase() === customerName.toLowerCase());
    
    if (!customer) {
      customer = {
        id: uuidv4(),
        name: customerName,
        phone: customerPhone,
        totalBills: 1,
        totalPaid: amount,
        lastPaymentDate: date
      };
      saveCustomers([...customers, customer]);
    } else {
      const updatedCustomers = customers.map(c => {
        if (c.id === customer!.id) {
          return { 
            ...c, 
            totalBills: c.totalBills + 1,
            totalPaid: c.totalPaid + amount,
            lastPaymentDate: date
          };
        }
        return c;
      });
      saveCustomers(updatedCustomers);
    }

    const finalReceiptNumber = receiptNumber || getNextReceiptNumber();

    const newBill: Bill = {
      id: uuidv4(),
      receiptNumber: finalReceiptNumber,
      date,
      customerName,
      customerPhone,
      paymentReceivedBy,
      amount,
      paymentMethod,
      upiTransactionId: paymentMethod === "UPI" ? upiTransactionId : undefined,
      amountInWords,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const bills = getBills();
    saveBills([newBill, ...bills]);
    router.push(`/bills/${newBill.id}`);
  };

  if (!mounted) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <PageHeader 
        title="Create Receipt" 
        action={
          <Button onClick={handleSave} icon={<Save className="h-4 w-4" />}>
            Save & Generate
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Receipt Information" />
          <CardContent className="space-y-4">
            <Input 
              label="Receipt Number" 
              value={receiptNumber} 
              onChange={e => setReceiptNumber(e.target.value)} 
            />
            <Input 
              type="date" 
              label="Date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
            />
            <Input 
              label="Received By" 
              value={paymentReceivedBy} 
              onChange={e => setPaymentReceivedBy(e.target.value)} 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Customer Details" />
          <CardContent className="space-y-4">
            <Input 
              label="Customer Name" 
              placeholder="John Doe" 
              value={customerName} 
              onChange={e => setCustomerName(e.target.value)} 
            />
            <Input 
              label="Phone Number" 
              placeholder="(555) 123-4567" 
              value={customerPhone} 
              onChange={e => setCustomerPhone(e.target.value)} 
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader title="Payment Details" />
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              type="number"
              label="Amount (₹)" 
              value={amount || ""} 
              onChange={e => setAmount(parseFloat(e.target.value) || 0)} 
            />
            <Select 
              label="Payment Method"
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
              options={[
                { label: "Cash", value: "Cash" },
                { label: "UPI", value: "UPI" }
              ]}
            />
          </div>
          
          {paymentMethod === "UPI" && (
            <Input 
              label="UPI Transaction ID" 
              placeholder="Enter transaction reference" 
              value={upiTransactionId} 
              onChange={e => setUpiTransactionId(e.target.value)} 
            />
          )}

          <div className="pt-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Amount in Words</label>
            <div className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-700 italic min-h-[38px]">
              {amountInWords || "Zero Only"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
