"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar,
  Eye,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
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
import { getDashboardData } from "@/actions/stationRegistral/dashboard";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PageProps {
  params: Promise<{ lang: string }>;
}

interface DashboardData {
  orders: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  thisMonth: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  citizens: {
    total: number;
  };
  chartData: Array<{
    month: string;
    pending: number;
    approved: number;
    rejected: number;
    total: number;
  }>;
  chartDataByType: Array<{
    month: string;
    urgent: number;
    normal: number;
    total: number;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    orderStatus: string;
    orderType: string;
    amount: number;
    createdAt: Date;
    citizen: {
      firstName: string;
      lastName: string;
      middleName?: string | null;
    };
  }>;
  availableYears: number[];
  selectedYear: number;
}

export default function StationRegistrarDashboard({ params }: PageProps) {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lineChartYear, setLineChartYear] = useState<number>(new Date().getFullYear());
  const [typeChartYear, setTypeChartYear] = useState<number>(new Date().getFullYear());
  const [lineChartData, setLineChartData] = useState<any[]>([]);
  const [typeChartData, setTypeChartData] = useState<any[]>([]);
  const [isLineChartLoading, setIsLineChartLoading] = useState(false);
  const [isTypeChartLoading, setIsTypeChartLoading] = useState(false);

  const fetchData = async (year?: number) => {
    setIsLoading(true);
    try {
      const result = await getDashboardData(year);
      if (result.status && result.data) {
        setData(result.data);
        setLineChartYear(result.data.selectedYear);
        setTypeChartYear(result.data.selectedYear);
        setLineChartData(result.data.chartData);
        setTypeChartData(result.data.chartDataByType);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLineChartData = async (year: number) => {
    setIsLineChartLoading(true);
    try {
      const result = await getDashboardData(year);
      if (result.status && result.data) {
        setLineChartData(result.data.chartData);
      }
    } catch (error) {
      console.error("Failed to fetch line chart data:", error);
    } finally {
      setIsLineChartLoading(false);
    }
  };

  const fetchTypeChartData = async (year: number) => {
    setIsTypeChartLoading(true);
    try {
      const result = await getDashboardData(year);
      if (result.status && result.data) {
        setTypeChartData(result.data.chartDataByType);
      }
    } catch (error) {
      console.error("Failed to fetch type chart data:", error);
    } finally {
      setIsTypeChartLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLineChartYearChange = (year: string) => {
    const yearNum = parseInt(year);
    setLineChartYear(yearNum);
    fetchLineChartData(yearNum);
  };

  const handleTypeChartYearChange = (year: string) => {
    const yearNum = parseInt(year);
    setTypeChartYear(yearNum);
    fetchTypeChartData(yearNum);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Clock className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className="text-muted-foreground">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Pie chart data for order status distribution
  const pieData = [
    { name: "Pending", value: data.orders.pending, color: "#eab308" },
    { name: "Approved", value: data.orders.approved, color: "#22c55e" },
    { name: "Rejected", value: data.orders.rejected, color: "#ef4444" },
  ];

  return (
    <div className="h-full container px-4 py-8 overflow-y-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Station Registrar Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your station&apos;s orders and citizens
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Citizens */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Citizens
            </CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {data.citizens.total.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Registered in your station
            </p>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
            <Package className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {data.orders.total.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              All time orders
            </p>
          </CardContent>
        </Card>

        {/* Pending Orders */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Orders
            </CardTitle>
            <Clock className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {data.orders.pending.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Awaiting processing
            </p>
          </CardContent>
        </Card>

        {/* Approved Orders */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved Orders
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {data.orders.approved.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Successfully approved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* This Month Statistics */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            This Month Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {data.thisMonth.total}
              </div>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {data.thisMonth.pending}
              </div>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {data.thisMonth.approved}
              </div>
              <p className="text-sm text-muted-foreground">Approved</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {data.thisMonth.rejected}
              </div>
              <p className="text-sm text-muted-foreground">Rejected</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Monthly Statistics</h2>
        <p className="text-sm text-muted-foreground">
          Select different years for each chart to compare data
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Line Chart - Monthly Trends */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Monthly Order Trends
              </CardTitle>
              <Select
                value={lineChartYear.toString()}
                onValueChange={handleLineChartYearChange}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {data.availableYears && data.availableYears.length > 0 ? (
                    data.availableYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value={new Date().getFullYear().toString()}>
                      {new Date().getFullYear()}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="relative">
            {isLineChartLoading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                <Clock className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="pending"
                  stroke="#eab308"
                  strokeWidth={2}
                  name="Pending"
                />
                <Line
                  type="monotone"
                  dataKey="approved"
                  stroke="#22c55e"
                  strokeWidth={2}
                  name="Approved"
                />
                <Line
                  type="monotone"
                  dataKey="rejected"
                  stroke="#ef4444"
                  strokeWidth={2}
                  name="Rejected"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stacked Bar Chart - Orders by Type (URGENT vs NORMAL) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Orders by Type (Urgent vs Normal)
              </CardTitle>
              <Select
                value={typeChartYear.toString()}
                onValueChange={handleTypeChartYearChange}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {data.availableYears && data.availableYears.length > 0 ? (
                    data.availableYears.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value={new Date().getFullYear().toString()}>
                      {new Date().getFullYear()}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="relative">
            {isTypeChartLoading && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
                <Clock className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="urgent"
                  stackId="a"
                  fill="#ef4444"
                  name="Urgent Orders"
                />
                <Bar
                  dataKey="normal"
                  stackId="a"
                  fill="#3b82f6"
                  name="Normal Orders"
                />
              </BarChart>
            </ResponsiveContainer>
            {/* Summary below chart */}
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-red-50 rounded-lg border border-red-100">
                <div className="text-xl font-bold text-red-600">
                  {typeChartData.reduce((sum, d) => sum + d.urgent, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Total Urgent</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="text-xl font-bold text-blue-600">
                  {typeChartData.reduce((sum, d) => sum + d.normal, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Total Normal</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg border border-purple-100">
                <div className="text-xl font-bold text-purple-600">
                  {typeChartData.reduce((sum, d) => sum + d.total, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pie Chart and Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart - Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  Pending
                </span>
                <span className="font-semibold">{data.orders.pending}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  Approved
                </span>
                <span className="font-semibold">{data.orders.approved}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  Rejected
                </span>
                <span className="font-semibold">{data.orders.rejected}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentOrders.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No recent orders
                </p>
              ) : (
                data.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() =>
                      router.push(`/en/dashboard/trackOrder/${order.id}`)
                    }
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold">
                          Order #{order.orderNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.citizen.firstName}{" "}
                          {order.citizen.middleName || ""}{" "}
                          {order.citizen.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        className={`${getStatusColor(
                          order.orderStatus
                        )} border`}
                      >
                        {order.orderStatus}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
