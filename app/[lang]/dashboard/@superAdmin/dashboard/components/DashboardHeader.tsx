"use client";

import React from "react";
import { TrendingUp } from "lucide-react";

type DashboardHeaderProps = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

export default function DashboardHeader({ title, subtitle, right }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-start sm:items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <TrendingUp className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>
          {subtitle ? (
            <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}
