"use client";

import { Bell, Search, User } from "lucide-react";

export default function Header() {
  return (
    <header className="flex h-16 items-center justify-end border-b bg-white px-6 shadow-sm">
      <div className="flex items-center gap-3 border-l pl-4 ml-2">
        <div className="text-right hidden md:block">
          <p className="text-sm font-semibold text-slate-700">Admin User</p>
        </div>

        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
          <User className="h-5 w-5" />
        </div>
      </div>
    </header>
  );
}