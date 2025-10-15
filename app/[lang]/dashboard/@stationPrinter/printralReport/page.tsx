"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Download,
  Printer,
  CalendarIcon,
  BarChart,
  Users,
  Package,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Mock data - replace with your actual data fetching logic
const mockReportData = {
  totalRegistered: 1250,
  totalOrders: 480,
  pending: 50,
  approved: 420,
  rejected: 10,
  stationName: "Finfinne Central Station",
  generatedBy: "Fuad Abdella", // Replace with actual logged-in user data
};

export default function StationPrinterPage() {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [reportData, setReportData] = useState<typeof mockReportData | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateReport = () => {
    // In a real app, you would fetch data here based on startDate and endDate
    // For example: const data = await getStationReport(startDate, endDate);
    setReportData(mockReportData);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const reportElement = document.getElementById("report-content");
    if (!reportElement) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const width = pdfWidth - 20; // with 10mm margin on each side
      const height = width / ratio;

      pdf.addImage(imgData, "PNG", 10, 10, width, height);
      pdf.save(`Station_Report_${format(new Date(), "yyyy-MM-dd")}.pdf`);
    } catch (error) {
      console.error("Failed to generate PDF", error);
      alert("Failed to generate PDF. Please check the console.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header and Controls */}
      <div className="no-print mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-4">
          <BarChart className="h-8 w-8" />
          Station Activity Report
        </h1>
        <div className="flex flex-wrap items-center gap-4 p-4 border rounded-lg bg-muted/40">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP") : "Pick a start date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <span className="text-muted-foreground">-</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP") : "Pick an end date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Button onClick={handleGenerateReport}>Generate Report</Button>
        </div>
      </div>

      {/* Report Content */}
      {reportData && (
        <>
          <div
            id="report-content"
            className="p-8 bg-white rounded-lg shadow-lg"
          >
            <header className="text-center mb-8">
              <h2 className="text-2xl font-bold">{reportData.stationName}</h2>
              <p className="text-lg text-muted-foreground">Activity Report</p>
              <p className="text-sm text-muted-foreground">
                {`From: ${format(startDate!, "PPP")} To: ${format(
                  endDate!,
                  "PPP"
                )}`}
              </p>
            </header>

            <main>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <StatCard
                  title="Total Registered"
                  value={reportData.totalRegistered}
                  icon={<Users />}
                />
                <StatCard
                  title="Total Card Orders"
                  value={reportData.totalOrders}
                  icon={<Package />}
                />
                <StatCard
                  title="Approved Cards"
                  value={reportData.approved}
                  icon={<CheckCircle />}
                  className="text-green-600"
                />
                <StatCard
                  title="Pending Cards"
                  value={reportData.pending}
                  icon={<Clock />}
                  className="text-yellow-600"
                />
                <StatCard
                  title="Rejected Cards"
                  value={reportData.rejected}
                  icon={<XCircle />}
                  className="text-red-600"
                />
              </div>
            </main>

            <footer className="mt-16 pt-8 border-t">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Generated By: {reportData.generatedBy}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Date: {format(new Date(), "PPP")}
                  </p>
                </div>
                <div className="w-64 text-center">
                  <div className="border-b-2 border-dotted border-black h-12"></div>
                  <p className="text-sm font-semibold">Signature</p>
                </div>
              </div>
            </footer>
          </div>

          <div className="flex gap-4 mt-6 no-print">
            <Button onClick={handlePrint} variant="outline">
              <Printer className="mr-2 h-4 w-4" /> Print Report
            </Button>
            <Button onClick={handleDownloadPDF} disabled={isGenerating}>
              <Download className="mr-2 h-4 w-4" />
              {isGenerating ? "Downloading..." : "Download as PDF"}
            </Button>
          </div>
        </>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #report-content,
          #report-content * {
            visibility: visible;
          }
          #report-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            border: none;
            box-shadow: none;
          }
          .no-print {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  className,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`h-6 w-6 ${className}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
