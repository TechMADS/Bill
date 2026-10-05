"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Menu, User } from "lucide-react";
import { clearAuthSession, getAuthSession } from "@/lib/auth";

export default function Header({
  shopName,
  onMenuClick,
}: {
  shopName: string;
  onMenuClick: () => void;
}) {
  const router = useRouter();
  const [session, setSession] = useState(getAuthSession());

  useEffect(() => {
    const syncSession = () => setSession(getAuthSession());
    syncSession();
    window.addEventListener("auth:changed", syncSession);
    return () => window.removeEventListener("auth:changed", syncSession);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    clearAuthSession();
    router.replace("/login");
  };

  return (
    <header className="flex h-16 min-w-0 shrink-0 items-center justify-between border-b bg-white px-3 shadow-sm sm:px-6 lg:justify-end">
      <div className="flex min-w-0 flex-1 items-center gap-2 lg:hidden">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="-ml-2 shrink-0 rounded-lg p-2 text-slate-600 hover:bg-slate-100"
        >
          <Menu className="h-6 w-6" />
        </button>
        <span className="min-w-0 flex-1 truncate font-bold text-slate-800">
          {shopName}
        </span>
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3 lg:ml-2 lg:border-l lg:pl-4">
        <div className="text-right hidden md:block">
          <p className="text-sm font-semibold text-slate-700">{session?.username || session?.shopId || "User"}</p>
        </div>

        <Link
          href="/settings"
          aria-label="Profile settings"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700"
        >
          <User className="h-5 w-5" />
        </Link>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-2 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:px-3"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}