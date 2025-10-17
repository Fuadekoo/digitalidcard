"use client";

import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export type PaymentMethod = { method: string; amount: number };

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export default function PaymentMethodsPieChart({
  data = [
    { method: "Credit Card", amount: 12500 },
    { method: "Cash", amount: 8500 },
    { method: "Digital Wallet", amount: 4200 },
    { method: "Bank Transfer", amount: 2800 },
  ],
  title = "Payment Methods Distribution",
  height = 240,
}: {
  data?: PaymentMethod[];
  title?: string;
  height?: number;
}) {
  // Calculate total for percentage
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
      <h4 className="text-md font-semibold text-gray-800 mb-4">{title}</h4>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            label={({ method, amount }: any) => {
              const percent = ((amount / total) * 100).toFixed(0);
              return `${method} ${percent}%`;
            }}
            outerRadius={80}
            fill="#8884d8"
            dataKey="amount"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any) => [`$${value}`, "Amount"]}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "0.5rem",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
