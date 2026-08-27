"use client";

import { Bell, Search, User } from "lucide-react";

export default function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
      <div className="flex items-center bg-slate-100 rounded-md px-3 py-2 w-96">
        <Search className="h-4 w-4 text-slate-400 mr-2" />
        <input
          type="text"
          placeholder="Search bills, customers, etc..."
          className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder:text-slate-400"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        <div className="flex items-center gap-3 border-l pl-4 ml-2">
          <div className="text-right hidden md:block">
            <p className="text-sm font-semibold text-slate-700">Admin User</p>
            <p className="text-xs text-slate-500">admin@billingdemo.com</p>
          </div>
          <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
            <User className="h-5 w-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
