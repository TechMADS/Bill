"use client";

import { useState, useEffect } from "react";
import { FileText, Loader2, Save } from "lucide-react";
import { createBill, getNextReceiptNumber, PaymentMethod } from "@/lib/bills";
import { getSettings } from "@/lib/settings";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { numberToWords } from "@/lib/numberToWords";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import Link from "next/link";

export default function CreateBill() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const [receiptNumber, setReceiptNumber] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  
  const [amount, setAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [paymentReceivedBy, setPaymentReceivedBy] = useState("Admin");
  const [amountInWords, setAmountInWords] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const s = getSettings();
    setPaymentReceivedBy(s.defaultReceiverName || "Admin");
    setMounted(true);
  }, []);

  useEffect(() => {
    getNextReceiptNumber()
      .then(setReceiptNumber)
      .catch(error => alert(error instanceof Error ? `Failed to generate receipt number: ${error.message}` : "Failed to generate receipt number"));
  }, []);

  useEffect(() => {
    if (amount > 0) {
      setAmountInWords(numberToWords(amount));
    } else {
      setAmountInWords("");
    }
  }, [amount]);

  const handleSave = async () => {
    if (!customerName || amount <= 0) {
      alert("Please enter customer name and valid amount");
      return;
    }
    if (!receiptNumber) {
      alert("Receipt number is still being generated. Please try again.");
      return;
    }

    setIsSaving(true);
    const finalReceiptNumber = receiptNumber;
    const createdAt = new Date().toISOString();

    const fields: Record<string, string> = {
      "Receipt Number": finalReceiptNumber,
      "Date": date,
      "Customer Name": customerName,
      "Customer Phone": customerPhone,
      "Payment Received By Number": paymentReceivedBy || "Admin",
      "Amount": String(amount),
      "Payment Method": paymentMethod,
      "Amount in Words": amountInWords,
      "Created At": createdAt,
      "Updated At": createdAt,
    };
    try {
      const newBill = await createBill({ fields });
      const billRouteId = newBill.id || newBill.receiptNumber;
      if (!billRouteId) {
        throw new Error("Unable to identify the newly created bill");
      }
      router.push(`/bills/${encodeURIComponent(billRouteId)}`);
    } catch (error) {
      alert(error instanceof Error ? `Failed to save bill: ${error.message}` : "Failed to save bill");
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <PageHeader 
        title="Create Receipt" 
        action={
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:gap-3">
            <Button className="flex-1 sm:flex-none" onClick={handleSave} disabled={isSaving} icon={isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}>
              {isSaving ? "Saving..." : "Save & Generate"}
            </Button>
            <Link href="/create-gst-bill">
              <Button className="flex-1 sm:flex-none" type="button" variant="secondary" icon={<FileText className="h-4 w-4" />}>
                GST BILL
              </Button>
            </Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Receipt Information" />
          <CardContent className="space-y-4">
            <Input 
              label="Receipt Number" 
              value={receiptNumber}
              readOnly
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
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={10}
              onChange={e => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} 
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
