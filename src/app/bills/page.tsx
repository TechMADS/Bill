"use client";

import { useState, useEffect } from "react";
import { getBills, Bill, PaymentMethod } from "@/lib/bills";
import { getSettings } from "@/lib/settings";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BillTable } from "@/components/bills/BillTable";
import { BillFilters } from "@/components/bills/BillFilters";

export default function BillsList() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [mounted, setMounted] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | "All">("All");

  useEffect(() => {
    const b = getBills();
    setBills(b);
    setFilteredBills(b);
    setMounted(true);
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

  if (!mounted) return null;

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
