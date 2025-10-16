"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Building2,
  UserCheck,
  UserCog,
  Printer,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DashboardData {
  orders: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
  citizens: {
    total: number;
    male: number;
    female: number;
  };
  users: {
    total: number;
    stationAdmins: number;
    stationRegistrars: number;
    stationPrinters: number;
  };
  station: {
    id: string;
    code: string;
    afanOromoName: string;
    amharicName: string;
    stationAdminName: string;
    _count: {
      order: number;
      citizen: number;
      users: number;
    };
  } | null;
  recentOrders: Array<{
    id: string;
    orderStatus: string;
    orderType: string;
    createdAt: Date;
    citizen: {
      firstName: string;
      lastName: string;
    };
    station: {
      code: string;
      afanOromoName: string;
      amharicName: string;
    };
  }>;
}

interface StationAdminDashboardUIProps {
  data: DashboardData;
}

export default function StationAdminDashboardUI({
  data,
}: StationAdminDashboardUIProps) {
  const { orders, citizens, users, station, recentOrders } = data;

  // Calculate percentages and trends
  const acceptanceRate =
    orders.total > 0
      ? ((orders.accepted / orders.total) * 100).toFixed(1)
      : "0";
  const pendingRate =
    orders.total > 0 ? ((orders.pending / orders.total) * 100).toFixed(1) : "0";
  const genderRatio =
    citizens.total > 0
      ? ((citizens.male / citizens.total) * 100).toFixed(1)
      : "50";

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        variant: "default" as const,
        label: "Pending",
        className: "bg-yellow-500 hover:bg-yellow-600 text-white",
      },
      APPROVED: {
        variant: "default" as const,
        label: "Approved",
        className: "bg-green-500 hover:bg-green-600 text-white",
      },
      REJECTED: {
        variant: "default" as const,
        label: "Rejected",
        className: "bg-red-500 hover:bg-red-600 text-white",
      },
    };
    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-emerald-600 to-blue-600 text-white py-8 px-6 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold animate-fade-in">
                Station Admin Dashboard
              </h1>
              {station && (
                <div className="space-y-1 text-white/90">
                  <p className="text-lg font-semibold">
                    {station.afanOromoName} / {station.amharicName}
                  </p>
                  <p className="text-sm">
                    Station Code:{" "}
                    <span className="font-mono font-bold">{station.code}</span>
                  </p>
                  <p className="text-sm">
                    Admin:{" "}
                    <span className="font-semibold">
                      {station.stationAdminName}
                    </span>
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
                <Activity className="w-8 h-8 mx-auto mb-2 animate-pulse" />
                <p className="text-xs text-white/80">System Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            className="w-full h-6"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,0 C300,60 900,60 1200,0 L1200,120 L0,120 Z"
              fill="rgb(249 250 251)"
            />
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-8">
        {/* Order Statistics */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" />
            Order Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Total Orders */}
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-t-4 border-t-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">
                      Total Orders
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {orders.total}
                    </p>
                    <div className="flex items-center text-xs text-blue-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      <span>All time</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="w-7 h-7 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pending Orders */}
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-t-4 border-t-yellow-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {orders.pending}
                    </p>
                    <div className="flex items-center text-xs text-yellow-600">
                      <span>{pendingRate}% of total</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="w-7 h-7 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Approved Orders */}
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-t-4 border-t-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">
                      Approved
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {orders.accepted}
                    </p>
                    <div className="flex items-center text-xs text-green-600">
                      <ArrowUpRight className="w-4 h-4 mr-1" />
                      <span>{acceptanceRate}% approval rate</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rejected Orders */}
            <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-t-4 border-t-red-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">
                      Rejected
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {orders.rejected}
                    </p>
                    <div className="flex items-center text-xs text-red-600">
                      <ArrowDownRight className="w-4 h-4 mr-1" />
                      <span>Needs review</span>
                    </div>
                  </div>
                  <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-7 h-7 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Citizens & Users Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Citizens Statistics */}
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6" />
                Citizen Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total Citizens</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {citizens.total}
                  </p>
                </div>
                <Users className="w-10 h-10 text-purple-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-1">Male</p>
                  <p className="text-xl font-bold text-blue-600">
                    {citizens.male}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{genderRatio}%</p>
                </div>
                <div className="p-4 bg-pink-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-1">Female</p>
                  <p className="text-xl font-bold text-pink-600">
                    {citizens.female}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(100 - parseFloat(genderRatio)).toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Users Statistics */}
          <Card className="hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="w-6 h-6" />
                Staff Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Total Staff</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {users.total}
                  </p>
                </div>
                <Building2 className="w-10 h-10 text-indigo-500" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <UserCog className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Admins
                    </span>
                  </div>
                  <span className="text-lg font-bold text-orange-600">
                    {users.stationAdmins}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Registrars
                    </span>
                  </div>
                  <span className="text-lg font-bold text-green-600">
                    {users.stationRegistrars}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Printer className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Printers
                    </span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">
                    {users.stationPrinters}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders Table */}
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-6 h-6" />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Citizen
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {order.citizen.firstName} {order.citizen.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="text-sm text-gray-600 capitalize">
                            {order.orderType.replace("_", " ")}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(order.orderStatus)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                          <div className="text-sm text-gray-500">
                            {formatDate(order.createdAt)}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No recent orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Custom Animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
