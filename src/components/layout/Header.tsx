"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User } from "lucide-react";
import { clearAuthSession, getAuthSession } from "@/lib/auth";

export default function Header() {
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
    <header className="flex min-h-16 items-center justify-end border-b bg-white px-3 py-2 sm:px-6 shadow-sm">
      <div className="flex items-center gap-3 border-l pl-4 ml-2">
        <div className="text-right hidden md:block">
          <p className="text-sm font-semibold text-slate-700">{session?.username || session?.shopId || "User"}</p>
        </div>

        <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
          <User className="h-5 w-5" />
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}