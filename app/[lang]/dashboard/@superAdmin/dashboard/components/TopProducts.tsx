"use client";

import React from "react";

export type ProductRow = { product: string; sales: number; revenue: number };

export default function TopProducts({
  data = [
    { product: "Premium Card Print", sales: 45, revenue: 2250 },
    { product: "PVC Card Refill", sales: 32, revenue: 4800 },
    { product: "Smart ID Tag", sales: 28, revenue: 4200 },
    { product: "Lanyard Bundle", sales: 22, revenue: 880 },
    { product: "Holo Sticker", sales: 18, revenue: 900 },
  ],
  title = "Top Products",
}: {
  data?: ProductRow[];
  title?: string;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
      <h4 className="text-md font-semibold text-gray-800 mb-4">{title}</h4>
      <div className="space-y-3">
        {data.map((product, index) => (
          <div key={product.product} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                {index + 1}
              </div>
              <div>
                <p className="font-medium text-gray-900">{product.product}</p>
                <p className="text-sm text-gray-500">{product.sales} sales</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">${product.revenue.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
