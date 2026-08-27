import React from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card } from "../ui/Card";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ title, value, icon, trend, trendUp }: StatCardProps) {
  return (
    <Card className="p-6 flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className="rounded-full bg-slate-50 p-2">{icon}</div>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        {trend && (
          <span
            className={`flex items-center text-xs font-medium ${
              trendUp ? "text-green-600" : "text-red-600"
            }`}
          >
            {trendUp ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownRight className="mr-1 h-3 w-3" />}
            {trend}
          </span>
        )}
      </div>
    </Card>
  );
}
