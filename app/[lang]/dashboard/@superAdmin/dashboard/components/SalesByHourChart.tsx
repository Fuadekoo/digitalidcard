"use client";

import React, { useMemo } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type SalesPoint = { hour: string; total: number; online?: number; inStore?: number };

export default function SalesByHourChart({
  data,
  height = 300,
  title = "Sales by Hour",
}: {
  data?: SalesPoint[];
  height?: number;
  title?: string;
}) {
  const chartData = useMemo(
    () =>
      data ?? [
        { hour: "00:00", total: 0, online: 0, inStore: 0 },
        { hour: "02:00", total: 0, online: 0, inStore: 0 },
        { hour: "04:00", total: 0, online: 0, inStore: 0 },
        { hour: "06:00", total: 0, online: 0, inStore: 0 },
        { hour: "08:00", total: 120, online: 80, inStore: 40 },
        { hour: "10:00", total: 280, online: 150, inStore: 130 },
        { hour: "12:00", total: 450, online: 200, inStore: 250 },
        { hour: "14:00", total: 320, online: 180, inStore: 140 },
        { hour: "16:00", total: 380, online: 220, inStore: 160 },
        { hour: "18:00", total: 520, online: 300, inStore: 220 },
        { hour: "20:00", total: 680, online: 400, inStore: 280 },
        { hour: "22:00", total: 420, online: 350, inStore: 70 },
      ],
    [data]
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
      <h4 className="text-md font-semibold text-gray-800 mb-4">{title}</h4>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="hour" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "0.5rem" }} formatter={(value: any, name: any) => [`$${value}`, name]} />
          <Legend />
          <Line type="monotone" dataKey="total" name="Total Sales" stroke="#2563eb" strokeWidth={2} activeDot={{ r: 6 }} />
          <Line type="monotone" dataKey="online" name="Online" stroke="#16a34a" strokeWidth={2} />
          <Line type="monotone" dataKey="inStore" name="In-Store" stroke="#f59e0b" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
