"use client";

import React, { useState } from "react";
import { useData } from "@/hooks/useData";
import { getSingleStation, getStationUser } from "@/actions/superAdmin/station";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  UserCheck,
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Building2,
  Shield,
  Printer,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import { useSession } from "next-auth/react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { InlineSpinner, ButtonSpinner } from "@/components/ui/spinner";

interface StationReportPageProps {
  stationId: string;
}

interface ReportData {
  station: any;
  users: any[];
  totalUsers: number;
  activeUsers: number;
  totalCitizens: number;
  citizensThisYear: number;
  citizensThisMonth: number;
  totalOrders: number;
  ordersThisYear: number;
  ordersThisMonth: number;
  cardsPrinted: number;
  cardsThisYear: number;
  cardsThisMonth: number;
}

export default function StationReportPage({
  stationId,
}: StationReportPageProps) {
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === "superAdmin";
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Create stable parameters for useData
  const stationParams = React.useMemo(() => {
    console.log("🔍 Station params memoized:", stationId);
    return stationId;
  }, [stationId]);

  const userParams = React.useMemo(() => {
    const params = {
      stationId,
      search: "",
      currentPage: 1,
      row: 1000, // Get all users
      sort: "desc",
    };
    console.log("🔍 User params memoized:", params);
    return params;
  }, [stationId]);

  // Fetch station data
  console.log("🔍 Calling useData for station with params:", stationParams);
  const [stationData, isStationLoading] = useData(
    getSingleStation,
    null,
    stationParams
  );

  // Fetch user data
  console.log("🔍 Calling useData for users with params:", userParams);
  const [userData, isUserLoading] = useData(getStationUser, null, userParams);

  // Show loading state while data is being fetched
  if (isStationLoading || isUserLoading) {
    return <InlineSpinner message="Loading Report Data..." />;
  }

  // Mock data for demonstration - replace with real data from your backend
  const reportData: ReportData = {
    station: stationData || { name: "Loading...", location: "Loading..." },
    users: userData?.list || [],
    totalUsers: userData?.list?.length || 0,
    activeUsers:
      userData?.list?.filter((user: any) => user.isActive)?.length || 0,
    totalCitizens: 1250, // Mock data
    citizensThisYear: 450,
    citizensThisMonth: 85,
    totalOrders: 2100,
    ordersThisYear: 750,
    ordersThisMonth: 120,
    cardsPrinted: 1800,
    cardsThisYear: 650,
    cardsThisMonth: 95,
  };

  const generatePDFReport = async () => {
    setIsGeneratingPDF(true);

    try {
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(20);
      doc.text("Station Report", 20, 20);

      // Add station info
      doc.setFontSize(12);
      doc.text(`Station: ${reportData.station.name || "Unknown"}`, 20, 35);
      doc.text(`Location: ${reportData.station.location || "Unknown"}`, 20, 45);
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 55);

      // Add statistics table
      const statsData = [
        ["Metric", "Total", "This Year", "This Month"],
        ["Total Users", reportData.totalUsers.toString(), "-", "-"],
        ["Active Users", reportData.activeUsers.toString(), "-", "-"],
        [
          "Total Citizens",
          reportData.totalCitizens.toString(),
          reportData.citizensThisYear.toString(),
          reportData.citizensThisMonth.toString(),
        ],
        [
          "Total Orders",
          reportData.totalOrders.toString(),
          reportData.ordersThisYear.toString(),
          reportData.ordersThisMonth.toString(),
        ],
        [
          "Cards Printed",
          reportData.cardsPrinted.toString(),
          reportData.cardsThisYear.toString(),
          reportData.cardsThisMonth.toString(),
        ],
      ];

      autoTable(doc, {
        startY: 70,
        head: [statsData[0]],
        body: statsData.slice(1),
        theme: "grid",
        headStyles: { fillColor: [59, 130, 246] },
      });

      // Add user details table
      if (reportData.users.length > 0) {
        const finalY = (doc as any).lastAutoTable?.finalY || 100;
        doc.text("Station Users", 20, finalY + 20);

        const userData = reportData.users.map((user: any) => [
          user.username,
          user.role,
          user.isActive ? "Active" : "Inactive",
          user.isAdmin ? "Yes" : "No",
          new Date(user.createdAt).toLocaleDateString(),
        ]);

        autoTable(doc, {
          startY: finalY + 30,
          head: [["Username", "Role", "Status", "Admin", "Created"]],
          body: userData,
          theme: "grid",
          headStyles: { fillColor: [34, 197, 94] },
        });
      }

      // Download the PDF
      doc.save(
        `station-report-${reportData.station.name || "unknown"}-${
          new Date().toISOString().split("T")[0]
        }.pdf`
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Access Denied</h3>
          <p className="text-muted-foreground">
            Super admin access required to view reports.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="text-sm">
            <Building2 className="mr-2 h-4 w-4" />
            {reportData.station.name || "Loading Station..."}
          </Badge>
          <Badge variant="secondary" className="text-sm">
            <Calendar className="mr-2 h-4 w-4" />
            {new Date().toLocaleDateString()}
          </Badge>
        </div>
        <Button
          onClick={generatePDFReport}
          disabled={isGeneratingPDF}
          className="bg-red-600 hover:bg-red-700"
        >
          {isGeneratingPDF ? (
            <>
              <ButtonSpinner size={16} />
              <span className="ml-2">Generating...</span>
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Download PDF Report
            </>
          )}
        </Button>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {reportData.totalUsers}
            </div>
            <p className="text-xs text-muted-foreground">
              {reportData.activeUsers} active users
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Citizens
            </CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {reportData.totalCitizens.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {reportData.citizensThisYear} this year
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {reportData.totalOrders.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {reportData.ordersThisYear} this year
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cards Printed
            </CardTitle>
            <Printer className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {reportData.cardsPrinted.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {reportData.cardsThisYear} this year
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              This Month Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                New Citizens
              </span>
              <Badge variant="outline" className="text-green-600">
                {reportData.citizensThisMonth}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">New Orders</span>
              <Badge variant="outline" className="text-blue-600">
                {reportData.ordersThisMonth}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Cards Printed
              </span>
              <Badge variant="outline" className="text-orange-600">
                {reportData.cardsThisMonth}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Yearly Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Citizens This Year
              </span>
              <Badge variant="outline" className="text-green-600">
                {reportData.citizensThisYear}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Orders This Year
              </span>
              <Badge variant="outline" className="text-blue-600">
                {reportData.ordersThisYear}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Cards This Year
              </span>
              <Badge variant="outline" className="text-orange-600">
                {reportData.cardsThisYear}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Success Rate
              </span>
              <Badge variant="outline" className="text-green-600">
                98.5%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Avg Processing Time
              </span>
              <Badge variant="outline" className="text-blue-600">
                2.3 days
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                User Satisfaction
              </span>
              <Badge variant="outline" className="text-purple-600">
                4.8/5
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Station Users Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Station Users Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <div className="text-2xl font-bold text-blue-600">
                {reportData.totalUsers}
              </div>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <UserCheck className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {reportData.activeUsers}
              </div>
              <p className="text-sm text-muted-foreground">Active Users</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Shield className="h-8 w-8 mx-auto text-purple-600 mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {reportData.users.filter((user: any) => user.isAdmin).length}
              </div>
              <p className="text-sm text-muted-foreground">Admin Users</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
