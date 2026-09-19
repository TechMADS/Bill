"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Download, Printer, Trash2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { deleteBill, getBills, Bill } from "@/lib/bills";
import { isGstBill } from "@/lib/gst";
import { getSettings, BusinessSettings } from "@/lib/settings";
import { generatePDF } from "@/lib/pdf";
import { printDocument } from "@/lib/print";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { GstInvoicePreview } from "@/components/gst/GstInvoicePreview";

export default function GstBillDetails() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const shouldDownload = searchParams.get("download") === "1";
  const [bill, setBill] = useState<Bill | null>(null);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState("");
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getBills()
      .then(bills => setBill(bills.find(entry => (entry.id === id || entry.receiptNumber === id) && isGstBill(entry)) ?? null))
      .catch(() => setError("Unable to load this GST bill."))
      .finally(() => {
        setSettings(getSettings());
        setMounted(true);
      });
  }, [id]);

  useEffect(() => {
    if (bill && settings && shouldDownload) void handleDownloadPDF();
  }, [bill, settings, shouldDownload]);

  const handleDownloadPDF = async () => {
    if (!bill) return;
    try {
      await generatePDF(invoiceRef, `GST-${bill.receiptNumber}`);
    } catch {
      setError("Unable to generate the GST PDF. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!bill?.rowNumber || !confirm("Are you sure you want to delete this GST bill?")) return;
    try {
      await deleteBill(bill.rowNumber);
      router.push("/create-bill");
    } catch {
      setError("Unable to delete this GST bill. Please try again.");
    }
  };

  if (!mounted || !settings) return <Loading text="Loading GST bill..." />;
  if (error && !bill) {
    return <div className="mx-auto max-w-4xl space-y-4 pt-12 text-center"><h2 className="text-xl font-semibold text-slate-800">GST bill not found</h2><p className="text-sm text-red-600">{error}</p><Link href="/create-bill" className="text-blue-600 hover:underline">Return to Create Bill</Link></div>;
  }
  if (!bill) return <div className="mx-auto max-w-4xl pt-12 text-center"><h2 className="text-xl font-semibold text-slate-800">GST bill not found</h2><Link href="/create-bill" className="text-blue-600 hover:underline">Return to Create Bill</Link></div>;

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-20">
      <div className="flex flex-col justify-between gap-4 print:hidden sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Link href="/create-bill" className="rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-200"><ArrowLeft className="h-5 w-5" /></Link>
          <h1 className="text-2xl font-bold text-slate-800">GST Bill {bill.receiptNumber}</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="danger" onClick={handleDelete} icon={<Trash2 className="h-4 w-4" />}>Delete</Button>
          <Button variant="secondary" onClick={printDocument} icon={<Printer className="h-4 w-4" />}>Print</Button>
          <Button onClick={handleDownloadPDF} icon={<Download className="h-4 w-4" />}>Download PDF</Button>
        </div>
      </div>
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 print:hidden">{error}</div>}
      <GstInvoicePreview bill={bill} settings={settings} ref={invoiceRef} />
    </div>
  );
}
