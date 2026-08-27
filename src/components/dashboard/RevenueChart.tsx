"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardContent } from "../ui/Card";

interface RevenueChartProps {
  data: { name: string; revenue: number }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card className="lg:col-span-2">
      <CardHeader title="Revenue Overview" />
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(val) => `$${val}`} dx={-10} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                activeDot={{ r: 6, fill: '#2563eb' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
