"use client";

import React from "react";
import { DollarSign, Users, CreditCard, TrendingUp } from "lucide-react";

export type Summary = {
  label: string;
  value: string | number;
  trend?: string;
  icon?: React.ReactNode;
  accent?: "green" | "blue" | "amber" | "purple";
};

const accentMap: Record<NonNullable<Summary["accent"]>, string> = {
  green: "text-green-600 bg-green-100",
  blue: "text-blue-600 bg-blue-100",
  amber: "text-amber-600 bg-amber-100",
  purple: "text-purple-600 bg-purple-100",
};

export default function SummaryCards({
  items = [
    {
      label: "Total Revenue",
      value: "$28,400",
      trend: "+12.5%",
      icon: <DollarSign className="w-5 h-5" />,
      accent: "green" as const,
    },
    {
      label: "Transactions",
      value: 156,
      icon: <CreditCard className="w-5 h-5" />,
      accent: "blue" as const,
    },
    {
      label: "Active Users",
      value: 145,
      icon: <Users className="w-5 h-5" />,
      accent: "purple" as const,
    },
    {
      label: "Growth",
      value: "+12.5%",
      icon: <TrendingUp className="w-5 h-5" />,
      accent: "amber" as const,
    },
  ],
}: {
  items?: Summary[];
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <div key={item.label} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{item.label}</p>
              <p className="text-xl font-semibold text-gray-900 mt-1">{item.value}</p>
              {item.trend ? (
                <p className="text-xs text-gray-500 mt-0.5">{item.trend} vs yesterday</p>
              ) : null}
            </div>
            <div className={`p-2 rounded-lg ${item.accent ? accentMap[item.accent] : "text-gray-500 bg-gray-100"}`}>
              {item.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
