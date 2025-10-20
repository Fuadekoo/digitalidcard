"use client";

import React, { useState, useEffect } from "react";
import { getSuperPrinterReport } from "@/actions/superPrintral/report";
import { getAllStations } from "@/actions/superPrintral/dashboard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Download,
  Printer,
  BarChart,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  PrinterCheck,
  AlertCircle,
  FileText,
  Building2,
  Globe,
} from "lucide-react";
import { format, subDays } from "date-fns";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Badge } from "@/components/ui/badge";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { StationSelector, type Station } from "@/components/ui/station-selector";
import { InlineSpinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SuperPrinterReportPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedStationId, setSelectedStationId] = useState<string>("");
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoadingStations, setIsLoadingStations] = useState(true);
  const [reportGenerated, setReportGenerated] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Fetch stations on component mount
  useEffect(() => {
    const fetchStations = async () => {
      setIsLoadingStations(true);
      try {
        const result = await getAllStations();
        if (result.status && result.data) {
          setStations(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch stations:", error);
      } finally {
        setIsLoadingStations(false);
      }
    };
    fetchStations();
  }, []);

  // State to hold report data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateReport = async () => {
    if (!dateRange?.from || !dateRange?.to) return;
    
    setIsLoading(true);
    setReportGenerated(true);
    
    try {
      const result = await getSuperPrinterReport({
        startDate: format(dateRange.from, "yyyy-MM-dd"),
        endDate: format(dateRange.to, "yyyy-MM-dd"),
        stationId: selectedStationId || undefined,
      });
      setReportData(result);
    } catch (error) {
      console.error("Failed to generate report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedStation = stations.find((s) => s.id === selectedStationId);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const reportElement = document.getElementById("report-content");
    if (!reportElement) return;

    setIsGeneratingPDF(true);
    try {
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const ratio = canvasWidth / canvasHeight;
      const width = pdfWidth - 20;
      const height = width / ratio;

      pdf.addImage(imgData, "PNG", 10, 10, width, height);
      const fileName = selectedStationId
        ? `Super_Printer_Report_${selectedStation?.code}_${format(new Date(), "yyyy-MM-dd")}.pdf`
        : `Super_Printer_Report_All_Stations_${format(new Date(), "yyyy-MM-dd")}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error("Failed to generate PDF", error);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const data = reportData?.status && reportData?.data ? reportData.data : null;

  return (
    <div className="relative h-screen flex flex-col">
      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-background border-b shadow-sm no-print">
        <div className="container mx-auto px-6 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              Super Printer Activity Report
            </h1>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              <Globe className="mr-1 h-3 w-3" />
              Super Printer
            </Badge>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 pb-20 max-w-7xl">
          {/* Controls */}
          <div className="no-print mb-8">
            {/* Controls Card */}
            <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Generate Report
            </CardTitle>
            <CardDescription>
              Select station (optional) and date range to generate printing activity report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Station Selector */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Station Filter (Optional)
                </label>
                <StationSelector
                  stations={stations}
                  value={selectedStationId}
                  onValueChange={(value) => {
                    setSelectedStationId(value);
                    setReportGenerated(false);
                  }}
                  placeholder={isLoadingStations ? "Loading stations..." : "All Stations"}
                  disabled={isLoadingStations}
                />
              </div>

              {/* Date Range Picker */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Date Range
                </label>
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <BarChart className="mr-2 h-4 w-4" />
                      {dateRange?.from && dateRange?.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} -{" "}
                          {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        <span>Pick date range for report</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 max-h-[600px] overflow-auto" align="start">
                    <div className="flex flex-col lg:flex-row max-w-[95vw]">
                      {/* Quick Filters Sidebar */}
                      <div className="lg:border-r p-3 space-y-1 min-w-[140px] lg:max-h-[500px] overflow-y-auto">
                        <div className="text-xs font-semibold text-muted-foreground mb-2 px-2">
                          Quick Filters
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-xs h-8"
                          onClick={() => {
                            const today = new Date();
                            setDateRange({ from: today, to: today });
                            setReportGenerated(false);
                          }}
                        >
                          Today
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-xs h-8"
                          onClick={() => {
                            const today = new Date();
                            const yesterday = subDays(today, 1);
                            setDateRange({ from: yesterday, to: yesterday });
                            setReportGenerated(false);
                          }}
                        >
                          Yesterday
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-xs h-8"
                          onClick={() => {
                            const today = new Date();
                            const lastWeek = subDays(today, 7);
                            setDateRange({ from: lastWeek, to: today });
                            setReportGenerated(false);
                          }}
                        >
                          Last 7 days
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-xs h-8"
                          onClick={() => {
                            const today = new Date();
                            const lastMonth = subDays(today, 30);
                            setDateRange({ from: lastMonth, to: today });
                            setReportGenerated(false);
                          }}
                        >
                          Last 30 days
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-xs h-8"
                          onClick={() => {
                            const today = new Date();
                            const startOfMonth = new Date(
                              today.getFullYear(),
                              today.getMonth(),
                              1
                            );
                            setDateRange({ from: startOfMonth, to: today });
                            setReportGenerated(false);
                          }}
                        >
                          This month
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-xs h-8"
                          onClick={() => {
                            const today = new Date();
                            const lastMonthStart = new Date(
                              today.getFullYear(),
                              today.getMonth() - 1,
                              1
                            );
                            const lastMonthEnd = new Date(
                              today.getFullYear(),
                              today.getMonth(),
                              0
                            );
                            setDateRange({
                              from: lastMonthStart,
                              to: lastMonthEnd,
                            });
                            setReportGenerated(false);
                          }}
                        >
                          Last month
                        </Button>
                      </div>

                      {/* Calendar */}
                      <div className="p-3 overflow-x-auto">
                        <Calendar
                          mode="range"
                          defaultMonth={dateRange?.from || new Date()}
                          selected={dateRange}
                          onSelect={(range) => {
                            if (!range) {
                              setDateRange(undefined);
                              return;
                            }
                            
                            if (range?.from && range?.to) {
                              const isSameDate = range.from.getTime() === range.to.getTime();
                              
                              if (isSameDate) {
                                setDateRange({ from: range.from, to: undefined });
                                return;
                              } else {
                                setDateRange(range);
                                setIsDatePickerOpen(false);
                                setReportGenerated(false);
                              }
                            } else if (range?.from && !range?.to) {
                              setDateRange({ from: range.from, to: undefined });
                            }
                          }}
                          numberOfMonths={2}
                          modifiers={{
                            today: new Date(),
                          }}
                          modifiersClassNames={{
                            today: "bg-accent font-bold",
                          }}
                        />
                        {/* Helper text */}
                        <div className="text-xs text-muted-foreground text-center mt-2 border-t pt-2">
                          {!dateRange?.from && "Pick a start date"}
                          {dateRange?.from &&
                            !dateRange?.to &&
                            "Pick an end date"}
                          {dateRange?.from &&
                            dateRange?.to &&
                            dateRange.from.getTime() ===
                              dateRange.to.getTime() &&
                            "Same day selected"}
                        </div>
                      </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="border-t p-3 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          setDateRange(undefined);
                          setIsDatePickerOpen(false);
                          setReportGenerated(false);
                        }}
                      >
                        Clear
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        disabled={!dateRange?.from || !dateRange?.to}
                        onClick={() => setIsDatePickerOpen(false)}
                      >
                        Apply
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button 
                onClick={handleGenerateReport}
                disabled={!dateRange?.from || !dateRange?.to}
                className="min-w-[140px]"
              >
                <FileText className="mr-2 h-4 w-4" />
                Generate Report
              </Button>

              {reportGenerated && data && (
                <div className="flex gap-2 ml-auto">
                  <Button onClick={handlePrint} variant="outline">
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                  <Button onClick={handleDownloadPDF} disabled={isGeneratingPDF}>
                    <Download className="mr-2 h-4 w-4" />
                    {isGeneratingPDF ? "Downloading..." : "Download PDF"}
                  </Button>
                </div>
              )}
            </div>

            {/* Active Filters Display */}
            {(selectedStationId || (dateRange?.from && dateRange?.to)) && (
              <div className="flex items-center gap-2 mt-4 p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">Report filters:</span>
                {selectedStationId && selectedStation && (
                  <Badge variant="default" className="bg-purple-600">
                    <Building2 className="mr-1 h-3 w-3" />
                    {selectedStation.code}
                  </Badge>
                )}
                {!selectedStationId && (
                  <Badge variant="outline">
                    <Globe className="mr-1 h-3 w-3" />
                    All Stations
                  </Badge>
                )}
                {dateRange?.from && dateRange?.to && (
                  <Badge variant="secondary">
                    {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd, yyyy")}
                  </Badge>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {isLoading && reportGenerated && (
        <InlineSpinner message="Generating report..." />
      )}

      {/* Report Content */}
      {reportGenerated && data && (
        <div
          id="report-content"
          className="p-8 bg-white rounded-lg shadow-lg border"
        >
          {/* Header */}
          <header className="text-center mb-8 pb-6 border-b-2">
            <h2 className="text-3xl font-bold mb-2">
              {data.station ? data.station.name : "All Stations"}
            </h2>
            <p className="text-xl text-muted-foreground mb-1">
              Super Printer Activity Report
            </p>
            {data.station && (
              <p className="text-sm text-muted-foreground">
                Station Code: <strong>{data.station.code}</strong>
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-3">
              Report Period: {format(data.dateRange.start, "PPP")} to{" "}
              {format(data.dateRange.end, "PPP")}
            </p>
          </header>

          {/* Statistics */}
          <main>
            <div className="space-y-6">
              {/* Order Statistics */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    title="Total Orders"
                    value={data.orders.total}
                    icon={<Package />}
                  />
                  <StatCard
                    title="Approved"
                    value={data.orders.approved}
                    icon={<CheckCircle />}
                    className="text-green-600"
                  />
                  <StatCard
                    title="Pending"
                    value={data.orders.pending}
                    icon={<Clock />}
                    className="text-yellow-600"
                  />
                  <StatCard
                    title="Rejected"
                    value={data.orders.rejected}
                    icon={<XCircle />}
                    className="text-red-600"
                  />
                </div>
              </div>

              {/* Printing Statistics */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <PrinterCheck className="h-5 w-5" />
                  Printing Statistics
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    title="Total Printed"
                    value={data.printing.totalPrinted}
                    icon={<PrinterCheck />}
                    className="text-green-600"
                  />
                  <StatCard
                    title="Not Printed"
                    value={data.printing.notPrinted}
                    icon={<AlertCircle />}
                    className="text-blue-600"
                  />
                  <StatCard
                    title="Printed by Me"
                    value={data.printing.printedByMe}
                    icon={<CheckCircle />}
                    className="text-purple-600"
                  />
                  <StatCard
                    title="Print Rate"
                    value={`${data.printing.printRate}%`}
                    icon={<BarChart />}
                    className="text-indigo-600"
                  />
                </div>
              </div>

              {/* Station Breakdown (only when not filtering by specific station) */}
              {!selectedStationId && data.stationBreakdown && data.stationBreakdown.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Station-wise Breakdown
                  </h3>
                  <Card>
                    <CardContent className="p-0">
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Station</TableHead>
                              <TableHead className="text-right">Total Orders</TableHead>
                              <TableHead className="text-right">Printed</TableHead>
                              <TableHead className="text-right">Not Printed</TableHead>
                              <TableHead className="text-right">Print Rate</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.stationBreakdown.map((station: {
                              stationCode: string;
                              stationName: string;
                              totalOrders: number;
                              printed: number;
                              notPrinted: number;
                            }) => (
                              <TableRow key={station.stationCode}>
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
                                  {station.printed}
                                </TableCell>
                                <TableCell className="text-right text-blue-600">
                                  {station.notPrinted}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Badge variant="outline">
                                    {station.totalOrders > 0 
                                      ? Math.round((station.printed / station.totalOrders) * 100)
                                      : 0}%
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </main>

          {/* Footer */}
          <footer className="mt-12 pt-6 border-t">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  <strong>Generated By:</strong> {data.generatedBy}
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Generated On:</strong> {format(new Date(), "PPP")}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  <strong>Scope:</strong> {selectedStationId ? `Station ${selectedStation?.code}` : "All Stations"}
                </p>
              </div>
              <div className="w-64 text-center">
                <div className="border-b-2 border-dotted border-black h-12 mb-2"></div>
                <p className="text-sm font-semibold">Authorized Signature</p>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* Empty State */}
      {!reportGenerated && (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Report Generated</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Select a date range and optionally filter by station, then click
              &quot;Generate Report&quot; to view printing activity statistics.
            </p>
          </CardContent>
        </Card>
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
            padding: 20mm;
            border: none;
            box-shadow: none;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
        </div>
      </div>
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
