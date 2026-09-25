"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { consumeCachedBill, deleteBill, getBills, Bill } from "@/lib/bills";
import { isGstBill } from "@/lib/gst";
import { getAuthenticatedSettings, getSettings, BusinessSettings } from "@/lib/settings";
import { ArrowLeft, Download, Printer, Trash2 } from "lucide-react";
import Link from "next/link";
import { generatePDF } from "@/lib/pdf";
import { printDocument } from "@/lib/print";
import { Button } from "@/components/ui/Button";
import { ReceiptPreview } from "@/components/receipt/ReceiptPreview";

export default function BillDetails() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const shouldDownload = searchParams.get("download") === "1";
  
  const [bill, setBill] = useState<Bill | null>(null);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [mounted, setMounted] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cachedBill = consumeCachedBill(id);
    if (cachedBill && !isGstBill(cachedBill)) {
      setBill(cachedBill);
      setSettings(getSettings());
      setMounted(true);
      return;
    }

    Promise.all([getBills(), getAuthenticatedSettings()])
      .then(([bills, currentSettings]) => {
        setBill(bills.find(bill => !isGstBill(bill) && (bill.id === id || bill.receiptNumber === id)) ?? null);
        setSettings(currentSettings);
      })
      .catch(error => alert(error instanceof Error ? `Failed to fetch bill: ${error.message}` : "Failed to fetch bill"))
      .finally(() => {
        setMounted(true);
      });
  }, [id]);

  useEffect(() => {
    if (bill && settings && shouldDownload) {
      void handleDownloadPDF();
    }
  }, [bill, settings, shouldDownload]);

  if (!mounted || !settings) return null;

  if (!bill) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 pt-20">
        <h2 className="text-xl font-semibold text-slate-800">Receipt not found</h2>
        <Link href="/bills" className="text-blue-600 hover:underline">Return to receipts list</Link>
      </div>
    );
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this receipt?")) {
      if (!bill?.rowNumber) {
        alert("This bill has no valid sheet row number");
        return;
      }
      try {
        await deleteBill(bill.rowNumber);
        router.push("/bills");
      } catch (error) {
        alert(error instanceof Error ? `Failed to delete bill: ${error.message}` : "Failed to delete bill");
      }
    }
  };

  const handlePrint = () => {
    printDocument();
  };

  const handleDownloadPDF = async () => {
    try {
      await generatePDF(receiptRef, bill.receiptNumber);
    } catch (err: unknown) {
      alert(`Failed to generate PDF: ${err instanceof Error ? err.message : "Unknown PDF error"}`);
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
        
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Button className="flex-1 sm:flex-none" variant="danger" onClick={handleDelete} icon={<Trash2 className="h-4 w-4" />}>
            Delete
          </Button>
          <Button className="flex-1 sm:flex-none" variant="secondary" onClick={handlePrint} icon={<Printer className="h-4 w-4" />}>
            Print
          </Button>
          <Button className="flex-1 sm:flex-none" onClick={handleDownloadPDF} icon={<Download className="h-4 w-4" />}>
            Download PDF
          </Button>
        </div>
      </div>

      <ReceiptPreview bill={bill} settings={settings} ref={receiptRef} />
    </div>
  );
}
