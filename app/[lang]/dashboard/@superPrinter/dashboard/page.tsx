"use client";

import React, { useState, useEffect } from "react";
import { useData } from "@/hooks/useData";
import { getDashboardData } from "@/actions/superPrintral/dashboard";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  AlertTriangle,
  ListChecks,
  Building2,
  Globe,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SuperPrinterDashboardPage() {
  const [dashboardData, isLoading, refresh] = useData(
    getDashboardData,
    () => {}
  );

  if (isLoading || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="text-muted-foreground">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (!dashboardData.status || !dashboardData.data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Failed to Load Data</h3>
          <p className="text-muted-foreground">{dashboardData.message || "Unable to load dashboard data"}</p>
        </div>
      </div>
    );
  }

  const data = dashboardData.data;

  const pieData = [
    { name: "Approved", value: data.approvedOrders, color: "#22c55e" },
    { name: "Pending", value: data.pendingOrders, color: "#eab308" },
    { name: "Rejected", value: data.rejectedOrders, color: "#ef4444" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <Badge variant="default">Approved</Badge>;
      case "PENDING":
        return <Badge variant="secondary">Pending</Badge>;
      case "REJECTED":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 overflow-y-auto h-full">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Globe className="h-8 w-8 text-purple-600" />
            Super Printer Dashboard
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage citizen card printing across all stations
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Orders"
          value={data.totalOrders.toLocaleString()}
          icon={<Package className="h-5 w-5 text-muted-foreground" />}
          description="All card orders across stations"
        />
        <StatCard
          title="Approved"
          value={data.approvedOrders.toLocaleString()}
          icon={<CheckCircle className="h-5 w-5 text-green-500" />}
          description={`${data.statistics.approvalRate}% approval rate`}
        />
        <StatCard
          title="Pending"
          value={data.pendingOrders.toLocaleString()}
          icon={<Clock className="h-5 w-5 text-yellow-500" />}
          description="Awaiting approval"
        />
        <StatCard
          title="Rejected"
          value={data.rejectedOrders.toLocaleString()}
          icon={<XCircle className="h-5 w-5 text-red-500" />}
          description={`${data.statistics.rejectionRate}% rejection rate`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rules and Recent Orders */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Important Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm text-muted-foreground list-disc pl-5">
              <li>You can manage orders from all stations.</li>
              <li>Ensure printer is calibrated before starting a batch.</li>
              <li>Only print orders that are marked as &quot;APPROVED&quot;.</li>
              <li>Double-check the card quality for any printing defects.</li>
              <li>Report any equipment malfunctions immediately.</li>
              <li>Coordinate with station admins for special requests.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-5 w-5" />
              Recent Orders (All Stations)
            </CardTitle>
            <CardDescription>Latest orders from all stations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentOrders.slice(0, 5).map((order: any) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-muted/20"
                >
                  <div className="flex-1">
                    <p className="font-semibold">
                      {order.citizen.firstName} {order.citizen.lastName}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>{order.orderNumber}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {order.station?.code || "N/A"}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(order.orderStatus)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Station Statistics Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Station Statistics
          </CardTitle>
          <CardDescription>
            Order statistics breakdown by station
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Station</TableHead>
                  <TableHead className="text-right">Total Orders</TableHead>
                  <TableHead className="text-right">Approved</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead className="text-right">Rejected</TableHead>
                  <TableHead className="text-right">Approval Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.stationStatistics.map((station: any) => (
                  <TableRow key={station.stationId}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{station.stationName}</div>
                        <div className="text-xs text-muted-foreground">
                          {station.stationCode}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {station.totalOrders}
                    </TableCell>
                    <TableCell className="text-right text-green-600">
                      {station.approvedOrders}
                    </TableCell>
                    <TableCell className="text-right text-yellow-600">
                      {station.pendingOrders}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {station.rejectedOrders}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline">{station.approvalRate}%</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Status Breakdown
            </CardTitle>
            <CardDescription>
              Overall order status distribution across all stations
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${((percent as number) * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  dataKey="value"
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Station Performance
            </CardTitle>
            <CardDescription>
              Order counts by station (top 5)
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={data.stationStatistics
                  .sort((a: any, b: any) => b.totalOrders - a.totalOrders)
                  .slice(0, 5)
                  .map((s: any) => ({
                    station: s.stationCode,
                    approved: s.approvedOrders,
                    pending: s.pendingOrders,
                    rejected: s.rejectedOrders,
                  }))
                }
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="station" />
                <YAxis />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    borderColor: "hsl(var(--border))",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="approved"
                  fill="#22c55e"
                  name="Approved"
                />
                <Bar
                  dataKey="pending"
                  fill="#eab308"
                  name="Pending"
                />
                <Bar
                  dataKey="rejected"
                  fill="#ef4444"
                  name="Rejected"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  description,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
