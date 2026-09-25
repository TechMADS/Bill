"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { billDateKey, deleteBill, getBills, Bill, PaymentMethod, sortBillsNewestFirst } from "@/lib/bills";
import { isGstBill } from "@/lib/gst";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BillTable } from "@/components/bills/BillTable";
import { BillFilters } from "@/components/bills/BillFilters";
import { EmptyState } from "@/components/ui/EmptyState";
import { Loading } from "@/components/ui/Loading";
import { Modal } from "@/components/ui/Modal";

export default function BillsList() {
  const router = useRouter();
  const [bills, setBills] = useState<Bill[]>([]);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | "All">("All");
  const [dateFilter, setDateFilter] = useState("");
  const [billToDelete, setBillToDelete] = useState<Bill | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const refreshBills = async () => {
    const allBills = await getBills();
    setBills(sortBillsNewestFirst(allBills));
  };

  useEffect(() => {
    const newBillReceipt = typeof window === "undefined"
      ? null
      : new URLSearchParams(window.location.search).get("newBill");
    getBills()
      .then(allBills => {
        const sortedBills = sortBillsNewestFirst(allBills);
        const savedBillIndex = newBillReceipt ? sortedBills.findIndex(bill => bill.receiptNumber === newBillReceipt) : -1;
        if (savedBillIndex > 0) {
          const [savedBill] = sortedBills.splice(savedBillIndex, 1);
          sortedBills.unshift(savedBill);
        }
        setBills(sortedBills);
        setFilteredBills(sortedBills);
        const savedBill = newBillReceipt ? sortedBills.find(bill => bill.receiptNumber === newBillReceipt) : null;
        if (savedBill && isGstBill(savedBill)) {
          router.push(`/gst-bills/${encodeURIComponent(savedBill.id)}`);
        }
      })
      .catch(error => setError(error instanceof Error ? error.message : "Failed to fetch bills"))
      .finally(() => {
        setLoading(false);
        setMounted(true);
      });
  }, [router]);

  const handleDelete = async () => {
    if (!billToDelete?.rowNumber || isDeleting) return;

    setIsDeleting(true);
    setDeleteError("");
    try {
      await deleteBill(billToDelete.rowNumber);
      setBillToDelete(null);
      await refreshBills();
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : "Failed to delete bill");
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    let result = bills;
    if (methodFilter !== "All") {
      result = result.filter(b => b.paymentMethod === methodFilter);
    }
    if (dateFilter) {
      result = result.filter(b => billDateKey(b.date) === dateFilter);
    }
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(b => 
        b.customerName.toLowerCase().includes(lower) ||
        b.customerPhone.toLowerCase().includes(lower) ||
        b.receiptNumber.toLowerCase().includes(lower)
      );
    }
    setFilteredBills(result);
  }, [searchTerm, methodFilter, dateFilter, bills]);

  if (!mounted || loading) return <Loading text="Loading bills History page..." />;
  if (error) return <EmptyState title="Unable to load bills" description={error} />;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader 
        title="Receipts" 
        action={
          <Link href="/create-bill">
            <Button>Create New</Button>
          </Link>
        }
      />

      <Card>
        <BillFilters 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          methodFilter={methodFilter}
          onMethodFilterChange={setMethodFilter}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
        />
        <BillTable bills={filteredBills} onDelete={(bill) => {
          setDeleteError("");
          setBillToDelete(bill);
        }} />
      </Card>

      <Modal
        isOpen={billToDelete !== null}
        onClose={() => {
          if (!isDeleting) {
            setDeleteError("");
            setBillToDelete(null);
          }
        }}
        title="Delete Bill?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setBillToDelete(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={isDeleting || !billToDelete?.rowNumber}>
              {isDeleting ? "Deleting..." : "Confirm Delete"}
            </Button>
          </>
        }
      >
        <p className="text-slate-600">Are you sure you want to delete this bill? This action cannot be undone.</p>
        {deleteError && <p className="mt-4 text-sm text-red-600" role="alert">{deleteError}</p>}
      </Modal>
    </div>
  );
}
