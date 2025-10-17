"use client";

import React from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export type PaymentMethod = { method: string; amount: number };

export default function PaymentMethodsChart({
  data = [
    { method: "Credit Card", amount: 12500 },
    { method: "Cash", amount: 8500 },
    { method: "Digital Wallet", amount: 4200 },
    { method: "Bank Transfer", amount: 2800 },
  ],
  title = "Payment Methods",
  height = 240,
}: {
  data?: PaymentMethod[];
  title?: string;
  height?: number;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
      <h4 className="text-md font-semibold text-gray-800 mb-4">{title}</h4>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="method" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          <Tooltip formatter={(value: any) => [`$${value}`, "Amount"]} contentStyle={{ backgroundColor: "white", border: "1px solid #e5e7eb", borderRadius: "0.5rem" }} />
          <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
