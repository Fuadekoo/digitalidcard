"use client";

import React, { useState, useEffect } from "react";
import { FileText, Printer, Download, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { getAllStations, getReport } from "@/actions/superAdmin/report";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Station = {
  id: string;
  code: string;
  afanOromoName: string;
  amharicName: string;
};

type ReportData = {
  station: {
    name: string;
    code: string;
  };
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
  totalUsers: number;
  totalRevenue: number;
};

export default function ReportUI() {
  const [stations, setStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch stations on mount
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const data = await getAllStations();
        setStations(data);
      } catch (error) {
        toast.error("Failed to load stations");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStations();
  }, []);

  const generateReport = async () => {
    if (!selectedStation || !startDate || !endDate) {
      toast.error("Please select station and date range");
      return;
    }

    if (startDate > endDate) {
      toast.error("Start date must be before end date");
      return;
    }

    setIsGenerating(true);

    try {
      const data = await getReport({
        startDate,
        endDate,
        stationId: selectedStation,
      });

      setReportData(data);
      toast.success("Report generated successfully");
    } catch (error) {
      toast.error("Failed to generate report");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!reportData || !startDate || !endDate) {
      toast.error("No report data to download");
      return;
    }

    try {
      const doc = new jsPDF();
      
      // Add header
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("Digital ID Card System", 14, 20);
      
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Station Activity Report", 14, 28);
      
      // Add report info
      doc.setFontSize(10);
      doc.text(`Report #: RPT-${Date.now().toString().slice(-6)}`, 150, 20);
      doc.text(`Generated: ${format(new Date(), "PPP")}`, 150, 26);
      
      // Add station info
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("Station Information", 14, 45);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Name: ${reportData.station.name}`, 14, 52);
      doc.text(`Code: ${reportData.station.code}`, 14, 58);
      
      doc.setFont("helvetica", "bold");
      doc.text("Report Period", 120, 45);
      doc.setFont("helvetica", "normal");
      doc.text(`From: ${format(startDate, "PPP")}`, 120, 52);
      doc.text(`To: ${format(endDate, "PPP")}`, 120, 58);
      
      // Add table with report data
      autoTable(doc, {
        startY: 70,
        head: [["Description", "Count"]],
        body: [
          ["Total Users", reportData.totalUsers.toString()],
          ["Total Registered Citizens", reportData.citizens.total.toString()],
          ["  • Male Citizens", reportData.citizens.male.toString()],
          ["  • Female Citizens", reportData.citizens.female.toString()],
          ["Total Order Cards", reportData.orders.total.toString()],
          ["  • Pending Cards", reportData.orders.pending.toString()],
          ["  • Approved Cards", reportData.orders.accepted.toString()],
          ["  • Rejected Cards", reportData.orders.rejected.toString()],
        ],
        theme: "striped",
        headStyles: { fillColor: [66, 66, 66] },
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 140 },
          1: { cellWidth: 40, halign: "right" },
        },
      });
      
      // Add total revenue
      const finalY = (doc as any).lastAutoTable.finalY || 150;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("TOTAL REVENUE", 14, finalY + 15);
      doc.setTextColor(34, 197, 94); // Green color
      doc.text(`$${(reportData.totalRevenue / 100).toFixed(2)}`, 180, finalY + 15, { align: "right" });
      
      // Add footer
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.text("This is a computer-generated report", 105, 280, { align: "center" });
      doc.text("Digital ID Card Management System", 105, 285, { align: "center" });
      
      // Save the PDF
      doc.save(`Station_Report_${reportData.station.code}_${format(new Date(), "yyyy-MM-dd")}.pdf`);
      toast.success("Report downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to download PDF");
    }
  };

  return (
    <div className="p-4 md:p-6 overflow-y-auto">
      {/* Header */}
      <div className="mb-8 no-print">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Station Report</h1>
        <p className="text-gray-600">
          Generate comprehensive reports for station activities
        </p>
      </div>

      {/* Filter Section */}
      <Card className="mb-6 no-print">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Report Filters
          </CardTitle>
          <CardDescription>
            Select station and date range to generate report
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Station Selection */}
            <div className="space-y-2">
              <Label htmlFor="station">Select Station</Label>
              <Select
                value={selectedStation}
                onValueChange={setSelectedStation}
                disabled={isLoading}
              >
                <SelectTrigger id="station">
                  <SelectValue placeholder="Choose a station..." />
                </SelectTrigger>
                <SelectContent>
                  {stations.map((station) => (
                    <SelectItem key={station.id} value={station.id}>
                      {station.afanOromoName || station.amharicName} ({station.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Generate Button */}
          <div className="mt-6">
            <Button
              onClick={generateReport}
              disabled={isGenerating || !selectedStation || !startDate || !endDate}
              size="lg"
            >
              {isGenerating ? "Generating..." : "Generate Report"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Receipt */}
      {reportData && (
        <>
          {/* Action Buttons */}
          <div className="flex gap-3 mb-4 no-print">
            <Button onClick={handlePrint} variant="default" className="gap-2">
              <Printer className="w-4 h-4" />
              Print Report
            </Button>
            <Button onClick={handleDownload} variant="secondary" className="gap-2">
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
          </div>

          {/* Receipt */}
          <Card className="max-w-4xl mx-auto print-section">
            <CardContent className="p-8">
              {/* Header */}
              <div className="border-b-2 border-gray-300 pb-6 mb-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Digital ID Card System
                    </h2>
                    <p className="text-gray-600">Station Activity Report</p>
                  </div>
                  <div className="text-right">
                    <h3 className="text-3xl font-bold text-gray-900">RECEIPT</h3>
                    <p className="text-sm text-gray-600 mt-2">
                      Report #: RPT-{Date.now().toString().slice(-6)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Generated: {format(new Date(), "PPP")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Station Info */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Station Information
                  </h4>
                  <p className="text-gray-900 font-medium">
                    {reportData.station.name}
                  </p>
                  <p className="text-gray-600 text-sm">
                    Code: {reportData.station.code}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Report Period
                  </h4>
                  <p className="text-gray-900">
                    From: {startDate && format(startDate, "PPP")}
                  </p>
                  <p className="text-gray-900">
                    To: {endDate && format(endDate, "PPP")}
                  </p>
                </div>
              </div>

              {/* Report Data Table */}
              <div className="mb-8">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b-2 border-gray-300">
                      <th className="text-left py-3 px-4 text-gray-700 font-semibold">
                        DESCRIPTION
                      </th>
                      <th className="text-right py-3 px-4 text-gray-700 font-semibold">
                        COUNT
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 text-gray-900">Total Users</td>
                      <td className="py-3 px-4 text-right text-gray-900 font-medium">
                        {reportData.totalUsers}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 text-gray-900">
                        Total Registered Citizens
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900 font-medium">
                        {reportData.citizens.total}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 text-gray-900 pl-8">
                        • Male Citizens
                      </td>
                      <td className="py-3 px-4 text-right text-blue-600 font-medium">
                        {reportData.citizens.male}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 text-gray-900 pl-8">
                        • Female Citizens
                      </td>
                      <td className="py-3 px-4 text-right text-pink-600 font-medium">
                        {reportData.citizens.female}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 text-gray-900">
                        Total Order Cards
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900 font-medium">
                        {reportData.orders.total}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 text-gray-900 pl-8">
                        • Pending Cards
                      </td>
                      <td className="py-3 px-4 text-right text-orange-600 font-medium">
                        {reportData.orders.pending}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 text-gray-900 pl-8">
                        • Approved Cards
                      </td>
                      <td className="py-3 px-4 text-right text-green-600 font-medium">
                        {reportData.orders.accepted}
                      </td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-3 px-4 text-gray-900 pl-8">
                        • Rejected Cards
                      </td>
                      <td className="py-3 px-4 text-right text-red-600 font-medium">
                        {reportData.orders.rejected}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total Revenue */}
              <div className="border-t-2 border-gray-300 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">
                    TOTAL REVENUE
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    ${(reportData.totalRevenue / 100).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-12 pt-6 border-t border-gray-300">
                <div className="text-center">
                  <div className="mb-4">
                    <div className="inline-block border-t-2 border-gray-900 pt-2 px-8">
                      <p className="text-sm font-medium text-gray-700">
                        Authorized Signature
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    This is a computer-generated report
                  </p>
                  <p className="text-xs text-gray-500">
                    Digital ID Card Management System
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-section {
            box-shadow: none !important;
            border: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}
