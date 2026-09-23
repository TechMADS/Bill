"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, Plus, Save, Trash2 } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { createBill, getNextReceiptNumber } from "@/lib/bills";
import { getSettings } from "@/lib/settings";
import { calculateGstTotals, GstItem, GstMode, gstFields } from "@/lib/gst";
import { numberToWords } from "@/lib/numberToWords";
import { useRouter } from "next/navigation";

type FormItem = GstItem & { id: number };

const newItem = (id: number): FormItem => ({
  id,
  description: "",
  hsnSac: "",
  quantity: 1,
  unit: "Nos",
  rate: 0,
  gstRate: 18,
});

export default function CreateGstBill() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [receiptNumber, setReceiptNumber] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerGstin, setCustomerGstin] = useState("");
  const [placeOfSupply, setPlaceOfSupply] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [mode, setMode] = useState<GstMode>("intra");
  const [reverseCharge, setReverseCharge] = useState(false);
  const [items, setItems] = useState<FormItem[]>([newItem(1)]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getNextReceiptNumber()
      .then(setReceiptNumber)
      .catch(() => setError("Unable to generate an invoice number. Please try again."));
    setMounted(true);
  }, []);

  const totals = useMemo(() => calculateGstTotals(items, mode), [items, mode]);

  const updateItem = (id: number, field: keyof GstItem, value: string) => {
    setItems(current => current.map(item => item.id === id
      ? { ...item, [field]: field === "description" || field === "hsnSac" || field === "unit" ? value : Number(value) }
      : item
    ));
  };

  const handleSave = async () => {
    setError("");
    const settings = getSettings();
    if (!settings.businessName.trim() || !settings.address.trim() || !settings.gstNumber.trim() || !settings.state.trim()) {
      setError("Complete Business Name, Business Address, GST Number, and State in Settings before saving a GST bill.");
      return;
    }
    if (!receiptNumber) {
      setError("Invoice number is not ready yet. Please try again.");
      return;
    }
    if (!customerName.trim()) {
      setError("Enter the customer name.");
      return;
    }
    if (!placeOfSupply.trim()) {
      setError("Enter the place of supply.");
      return;
    }
    if (items.some(item => !item.description.trim() || !item.hsnSac.trim() || !Number.isFinite(item.quantity) || item.quantity <= 0 || !Number.isFinite(item.rate) || item.rate < 0 || !Number.isFinite(item.gstRate) || item.gstRate < 0 || item.gstRate > 100)) {
      setError("Each item needs a description, HSN/SAC, valid quantity, rate, and GST rate from 0 to 100.");
      return;
    }

    setIsSaving(true);
    const createdAt = new Date().toISOString();
    try {
      const fields = gstFields({
        supplierName: settings.businessLegalName || settings.businessName,
        supplierGstin: settings.gstNumber,
        receiptNumber,
        date,
        customerName: customerName.trim(),
        customerAddress: customerAddress.trim(),
        customerGstin: customerGstin.trim(),
        placeOfSupply: placeOfSupply.trim(),
        reverseCharge,
        paymentMethod,
        items: totals.items,
        totals,
        amountInWords: numberToWords(totals.grandTotal),
        createdAt,
      });
      const savedBill = await createBill({ fields });
      router.push(`/gst-bills/${encodeURIComponent(savedBill.id || savedBill.receiptNumber)}`);
    } catch {
      setError("GST bill could not be saved. Check your connection and try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      <PageHeader
        title="Create GST Bill"
        action={
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:gap-3">
            <Link href="/create-bill">
              <Button className="flex-1 sm:flex-none" type="button" variant="secondary" icon={<ArrowLeft className="h-4 w-4" />}>Normal Bill</Button>
            </Link>
            <Button className="flex-1 sm:flex-none" onClick={handleSave} disabled={isSaving} icon={isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}>
              {isSaving ? "Saving..." : "Save GST Bill"}
            </Button>
          </div>
        }
      />

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <Card>
        <CardHeader title="Invoice Information" />
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input label="Invoice Number" value={receiptNumber} readOnly />
          <Input label="Invoice Date" type="date" value={date} onChange={event => setDate(event.target.value)} />
          <Select label="Payment Method" value={paymentMethod} onChange={event => setPaymentMethod(event.target.value)} options={[{ label: "Cash", value: "Cash" }, { label: "UPI", value: "UPI" }]} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Customer Details" />
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="Customer Name" value={customerName} onChange={event => setCustomerName(event.target.value)} />
            <Input label="Customer GSTIN (optional)" value={customerGstin} onChange={event => setCustomerGstin(event.target.value)} />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Customer Address</label>
              <textarea rows={3} value={customerAddress} onChange={event => setCustomerAddress(event.target.value)} className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div className="space-y-4">
              <Input label="Place of Supply" value={placeOfSupply} onChange={event => setPlaceOfSupply(event.target.value)} placeholder="State / State Code" />
              <Select label="Tax Type" value={mode} onChange={event => setMode(event.target.value as GstMode)} options={[{ label: "Intra-state (CGST + SGST)", value: "intra" }, { label: "Inter-state (IGST)", value: "inter" }]} />
              <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={reverseCharge} onChange={event => setReverseCharge(event.target.checked)} /> Reverse Charge</label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title="Items / Services">
          <div className="mt-3">
            <Button type="button" size="sm" variant="secondary" onClick={() => setItems(current => [...current, newItem(Date.now())])} icon={<Plus className="h-4 w-4" />}>Add Item</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <div key={item.id} className="rounded-lg border border-slate-200 p-4">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-700">Item {index + 1}</p>
                {items.length > 1 && <Button type="button" size="sm" variant="danger" onClick={() => setItems(current => current.filter(entry => entry.id !== item.id))} icon={<Trash2 className="h-4 w-4" />}>Remove</Button>}
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
                <div className="md:col-span-2"><Input label="Description" value={item.description} onChange={event => updateItem(item.id, "description", event.target.value)} /></div>
                <Input label="HSN / SAC" value={item.hsnSac} onChange={event => updateItem(item.id, "hsnSac", event.target.value)} />
                <Input label="Quantity" type="number" min="0" step="0.01" value={item.quantity} onChange={event => updateItem(item.id, "quantity", event.target.value)} />
                <Input label="Unit" value={item.unit} onChange={event => updateItem(item.id, "unit", event.target.value)} />
                <Input label="Rate" type="number" min="0" step="0.01" value={item.rate} onChange={event => updateItem(item.id, "rate", event.target.value)} />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
                <Input label="GST %" type="number" min="0" max="100" step="0.01" value={item.gstRate} onChange={event => updateItem(item.id, "gstRate", event.target.value)} />
                <div className="rounded-md bg-slate-50 px-3 py-2 text-sm"><span className="block text-xs text-slate-500">Taxable Value</span><strong>{item.quantity * item.rate ? item.quantity * item.rate : 0}</strong></div>
                <div className="rounded-md bg-slate-50 px-3 py-2 text-sm"><span className="block text-xs text-slate-500">Tax</span><strong>{totals.items[index]?.cgst + totals.items[index]?.sgst + totals.items[index]?.igst || 0}</strong></div>
                <div className="rounded-md bg-slate-50 px-3 py-2 text-sm"><span className="block text-xs text-slate-500">Total</span><strong>{totals.items[index]?.total || 0}</strong></div>
              </div>
            </div>
          ))}
          <div className="ml-auto max-w-sm space-y-2 border-t border-slate-200 pt-4 text-sm">
            <div className="flex justify-between"><span>Total Taxable Value</span><strong>{totals.taxableValue.toFixed(2)}</strong></div>
            <div className="flex justify-between"><span>CGST</span><strong>{totals.cgst.toFixed(2)}</strong></div>
            <div className="flex justify-between"><span>SGST</span><strong>{totals.sgst.toFixed(2)}</strong></div>
            <div className="flex justify-between"><span>IGST</span><strong>{totals.igst.toFixed(2)}</strong></div>
            <div className="flex justify-between border-t border-slate-200 pt-2 text-base"><span>Grand Total</span><strong>{totals.grandTotal.toFixed(2)}</strong></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
