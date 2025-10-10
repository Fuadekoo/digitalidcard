"use client";

import React from "react";
import { Building2, Users, CreditCard, FileText, AlertCircle, CheckCircle } from "lucide-react";

export type Activity = {
  id: string;
  type: "station" | "user" | "transaction" | "report" | "alert" | "success";
  title: string;
  description: string;
  timestamp: string;
  metadata?: string;
};

const activityIcons = {
  station: Building2,
  user: Users,
  transaction: CreditCard,
  report: FileText,
  alert: AlertCircle,
  success: CheckCircle,
};

const activityColors = {
  station: "bg-blue-100 text-blue-600",
  user: "bg-green-100 text-green-600",
  transaction: "bg-purple-100 text-purple-600",
  report: "bg-orange-100 text-orange-600",
  alert: "bg-red-100 text-red-600",
  success: "bg-emerald-100 text-emerald-600",
};

export default function RecentActivities({
  data = [
    {
      id: "1",
      type: "station" as const,
      title: "New Station Created",
      description: "Station 'Downtown Office' has been created",
      timestamp: "2 minutes ago",
      metadata: "Location: Downtown",
    },
    {
      id: "2",
      type: "user" as const,
      title: "New User Added",
      description: "John Doe added as Station Admin",
      timestamp: "15 minutes ago",
      metadata: "Role: Station Admin",
    },
    {
      id: "3",
      type: "transaction" as const,
      title: "ID Card Issued",
      description: "ID card issued for citizen #12345",
      timestamp: "23 minutes ago",
      metadata: "Amount: $25.00",
    },
    {
      id: "4",
      type: "success" as const,
      title: "Payment Received",
      description: "Payment of $150 received from Station A",
      timestamp: "45 minutes ago",
      metadata: "Method: Bank Transfer",
    },
    {
      id: "5",
      type: "station" as const,
      title: "Station Updated",
      description: "Station 'Central Hub' information updated",
      timestamp: "1 hour ago",
      metadata: "Updated by: Admin",
    },
    {
      id: "6",
      type: "report" as const,
      title: "Monthly Report Generated",
      description: "Sales report for January 2024 generated",
      timestamp: "2 hours ago",
      metadata: "Total Sales: $45,000",
    },
    {
      id: "7",
      type: "user" as const,
      title: "User Permission Changed",
      description: "Sarah Smith promoted to Super Admin",
      timestamp: "3 hours ago",
      metadata: "Previous: Station Admin",
    },
    {
      id: "8",
      type: "alert" as const,
      title: "Low Stock Alert",
      description: "ID card stock running low at Station B",
      timestamp: "4 hours ago",
      metadata: "Remaining: 50 cards",
    },
    {
      id: "9",
      type: "transaction" as const,
      title: "Bulk Transaction",
      description: "50 ID cards processed in batch",
      timestamp: "5 hours ago",
      metadata: "Total: $1,250",
    },
    {
      id: "10",
      type: "station" as const,
      title: "Station Deactivated",
      description: "Station 'Old Branch' has been deactivated",
      timestamp: "6 hours ago",
      metadata: "Reason: Relocation",
    },
  ],
  title = "Recent Activities",
  maxHeight = 400,
}: {
  data?: Activity[];
  title?: string;
  maxHeight?: number;
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
      <h4 className="text-md font-semibold text-gray-800 mb-4">{title}</h4>
      
      <div 
        className="overflow-y-auto space-y-3 pr-2"
        style={{ maxHeight: `${maxHeight}px` }}
      >
        {data.map((activity) => {
          const Icon = activityIcons[activity.type];
          const colorClass = activityColors[activity.type];
          
          return (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
            >
              <div className={`p-2 rounded-lg ${colorClass} flex-shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h5 className="text-sm font-semibold text-gray-900 truncate">
                    {activity.title}
                  </h5>
                  <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                    {activity.timestamp}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mt-1">
                  {activity.description}
                </p>
                
                {activity.metadata && (
                  <p className="text-xs text-gray-500 mt-1 font-medium">
                    {activity.metadata}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
