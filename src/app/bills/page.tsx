"use client";

import { useState, useEffect } from "react";
import { getBills, Bill, PaymentMethod } from "@/lib/bills";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BillTable } from "@/components/bills/BillTable";
import { BillFilters } from "@/components/bills/BillFilters";
import { EmptyState } from "@/components/ui/EmptyState";
import { Loading } from "@/components/ui/Loading";

export default function BillsList() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | "All">("All");

  useEffect(() => {
    getBills()
      .then(b => {
        setBills(b);
        setFilteredBills(b);
      })
      .catch(error => setError(error instanceof Error ? error.message : "Failed to fetch bills"))
      .finally(() => {
        setLoading(false);
        setMounted(true);
      });
  }, []);

  useEffect(() => {
    let result = bills;
    if (methodFilter !== "All") {
      result = result.filter(b => b.paymentMethod === methodFilter);
    }
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(b => 
        b.customerName.toLowerCase().includes(lower) || 
        b.receiptNumber.toLowerCase().includes(lower)
      );
    }
    setFilteredBills(result);
  }, [searchTerm, methodFilter, bills]);

  if (!mounted || loading) return <Loading text="Loading bills from Google Sheets..." />;
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
        />
        <BillTable bills={filteredBills} currencySymbol="₹" />
      </Card>
    </div>
  );
}
