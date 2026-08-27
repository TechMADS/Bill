"use client";

import { useState, useEffect } from "react";
import { getCustomers, Customer } from "@/lib/customers";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { CustomerTable } from "@/components/customers/CustomerTable";

export default function CustomersList() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const c = getCustomers();
    setCustomers(c);
    setFilteredCustomers(c);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      setFilteredCustomers(customers.filter(c => 
        c.name.toLowerCase().includes(lower) || 
        c.phone.toLowerCase().includes(lower)
      ));
    } else {
      setFilteredCustomers(customers);
    }
  }, [searchTerm, customers]);

  if (!mounted) return null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <PageHeader title="Customers" />

      <Card>
        <div className="p-4 border-b bg-slate-50">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Search customers by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-300 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
            />
          </div>
        </div>

        <CustomerTable customers={filteredCustomers} currencySymbol="₹" />
      </Card>
    </div>
  );
}
