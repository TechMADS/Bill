"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Menu, X } from "lucide-react";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <Sidebar onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full min-w-0">
        <div className="lg:hidden flex items-center p-4 bg-white border-b">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="ml-4 font-bold text-slate-800">BillingPro</span>
        </div>
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
