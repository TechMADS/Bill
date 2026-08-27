"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { getBills, Bill, saveBills } from "@/lib/bills";
import { getSettings, BusinessSettings } from "@/lib/settings";
import { ArrowLeft, Download, Printer, Trash2 } from "lucide-react";
import Link from "next/link";
import { generatePDF } from "@/lib/pdf";
import { printDocument } from "@/lib/print";
import { Button } from "@/components/ui/Button";
import { ReceiptPreview } from "@/components/receipt/ReceiptPreview";

export default function BillDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [bill, setBill] = useState<Bill | null>(null);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [mounted, setMounted] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const bills = getBills();
    const foundBill = bills.find(b => b.id === id);
    if (foundBill) {
      setBill(foundBill);
    }
    setSettings(getSettings());
    setMounted(true);
  }, [id]);

  if (!mounted || !settings) return null;

  if (!bill) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 pt-20">
        <h2 className="text-xl font-semibold text-slate-800">Receipt not found</h2>
        <Link href="/bills" className="text-blue-600 hover:underline">Return to receipts list</Link>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this receipt?")) {
      const bills = getBills();
      saveBills(bills.filter(b => b.id !== id));
      router.push("/bills");
    }
  };

  const handlePrint = () => {
    printDocument();
  };

  const handleDownloadPDF = async () => {
    try {
      await generatePDF(receiptRef as any, bill.receiptNumber);
    } catch (err: any) {
      alert(`Failed to generate PDF: ${err.message}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-4">
          <Link href="/bills" className="p-2 rounded-full hover:bg-slate-200 text-slate-600 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-800">Receipt {bill.receiptNumber}</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="danger" onClick={handleDelete} icon={<Trash2 className="h-4 w-4" />}>
            Delete
          </Button>
          <Button variant="secondary" onClick={handlePrint} icon={<Printer className="h-4 w-4" />}>
            Print
          </Button>
          <Button onClick={handleDownloadPDF} icon={<Download className="h-4 w-4" />}>
            Download PDF
          </Button>
        </div>
      </div>

      <ReceiptPreview bill={bill} settings={settings} ref={receiptRef} />
    </div>
  );
}
