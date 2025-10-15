"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";

// --- Mock Data (Replace with your actual API calls) ---
const mockDashboardData = {
  stats: {
    totalCitizens: 1250,
    totalOrders: 480,
    pending: 50,
    approved: 420,
    rejected: 10,
  },
  monthlyChartData: [
    { month: "Jan", approved: 30, pending: 15, rejected: 5 },
    { month: "Feb", approved: 45, pending: 20, rejected: 2 },
    { month: "Mar", approved: 50, pending: 10, rejected: 8 },
    { month: "Apr", approved: 60, pending: 5, rejected: 1 },
    { month: "May", approved: 75, pending: 12, rejected: 3 },
    { month: "Jun", approved: 80, pending: 8, rejected: 0 },
  ],
  recentOrders: [
    {
      id: "1",
      orderNumber: "ORD-00124",
      citizenName: "John Doe",
      status: "APPROVED",
    },
    {
      id: "2",
      orderNumber: "ORD-00123",
      citizenName: "Jane Smith",
      status: "PENDING",
    },
    {
      id: "3",
      orderNumber: "ORD-00122",
      citizenName: "Abdi Ahmed",
      status: "REJECTED",
    },
    {
      id: "4",
      orderNumber: "ORD-00121",
      citizenName: "Fatuma Ali",
      status: "APPROVED",
    },
  ],
};
// --- End Mock Data ---

export default function StationPrinterDashboardPage() {
  const [data, setData] = useState(mockDashboardData); // In a real app, this would be null initially
  const [isLoading, setIsLoading] = useState(false); // Set to true when fetching

  // useEffect(() => {
  //   const fetchData = async () => {
  //     setIsLoading(true);
  //     const result = await getPrinterDashboardData(); // Your API call
  //     setData(result);
  //     setIsLoading(false);
  //   };
  //   fetchData();
  // }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data) {
    return <div>Failed to load dashboard data.</div>;
  }

  const pieData = [
    { name: "Approved", value: data.stats.approved, color: "#22c55e" },
    { name: "Pending", value: data.stats.pending, color: "#eab308" },
    { name: "Rejected", value: data.stats.rejected, color: "#ef4444" },
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
        <h2 className="text-3xl font-bold tracking-tight">Station Dashboard</h2>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Citizens"
          value={data.stats.totalCitizens.toLocaleString()}
          icon={<Users className="h-5 w-5 text-muted-foreground" />}
          description="Total registered citizens"
        />
        <StatCard
          title="Total Orders"
          value={data.stats.totalOrders.toLocaleString()}
          icon={<Package className="h-5 w-5 text-muted-foreground" />}
          description="All card orders placed"
        />
        <StatCard
          title="Approved"
          value={data.stats.approved.toLocaleString()}
          icon={<CheckCircle className="h-5 w-5 text-green-500" />}
          description="Successfully processed"
        />
        <StatCard
          title="Pending"
          value={data.stats.pending.toLocaleString()}
          icon={<Clock className="h-5 w-5 text-yellow-500" />}
          description="Awaiting approval"
        />
        <StatCard
          title="Rejected"
          value={data.stats.rejected.toLocaleString()}
          icon={<XCircle className="h-5 w-5 text-red-500" />}
          description="Orders that were rejected"
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
              <li>Ensure printer is calibrated before starting a batch.</li>
              <li>Only print orders that are marked as "APPROVED".</li>
              <li>Double-check the card quality for any printing defects.</li>
              <li>Report any equipment malfunctions immediately.</li>
              <li>Securely store printed cards before dispatch.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks />
              Recent Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold">{order.citizenName}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.orderNumber}
                    </p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity />
              Monthly Order Overview
            </CardTitle>
            <CardDescription>
              Summary of card orders by status for the last 6 months.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data.monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
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
                  stackId="a"
                  fill="#22c55e"
                  name="Approved"
                />
                <Bar
                  dataKey="pending"
                  stackId="a"
                  fill="#eab308"
                  name="Pending"
                />
                <Bar
                  dataKey="rejected"
                  stackId="a"
                  fill="#ef4444"
                  name="Rejected"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
            <CardDescription>Overall status of all orders.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
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
