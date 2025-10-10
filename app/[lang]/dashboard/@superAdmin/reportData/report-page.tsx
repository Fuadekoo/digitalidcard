"use client";

import React, { useState } from "react";
import { FileText, Printer, Download } from "lucide-react";

type ReportData = {
  stationName: string;
  stationCode: string;
  startDate: string;
  endDate: string;
  totalUsers: number;
  totalRegisteredCitizens: number;
  totalOrderCards: number;
  pendingCards: number;
  approvedCards: number;
  rejectedCards: number;
  totalRevenue: number;
};

export default function ReportPage() {
  const [selectedStation, setSelectedStation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock stations - replace with actual data from your API
  const stations = [
    { id: "1", name: "Downtown Office", code: "ST-001" },
    { id: "2", name: "Central Hub", code: "ST-002" },
    { id: "3", name: "North Branch", code: "ST-003" },
    { id: "4", name: "South Station", code: "ST-004" },
  ];

  const generateReport = async () => {
    if (!selectedStation || !startDate || !endDate) {
      alert("Please select station and date range");
      return;
    }

    setIsGenerating(true);

    // Simulate API call - replace with actual API call
    setTimeout(() => {
      const station = stations.find((s) => s.id === selectedStation);
      setReportData({
        stationName: station?.name || "",
        stationCode: station?.code || "",
        startDate,
        endDate,
        totalUsers: 45,
        totalRegisteredCitizens: 234,
        totalOrderCards: 189,
        pendingCards: 23,
        approvedCards: 156,
        rejectedCards: 10,
        totalRevenue: 4725.0,
      });
      setIsGenerating(false);
    }, 1000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Implement PDF download logic here
    alert("Download functionality - integrate with jsPDF");
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6 no-print">
        <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Report Filters
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Station Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Station
            </label>
            <select
              value={selectedStation}
              onChange={(e) => setSelectedStation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Choose a station...</option>
              {stations.map((station) => (
                <option key={station.id} value={station.id}>
                  {station.name} ({station.code})
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-6">
          <button
            onClick={generateReport}
            disabled={isGenerating}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? "Generating..." : "Generate Report"}
          </button>
        </div>
      </div>

      {/* Report Receipt */}
      {reportData && (
        <>
          {/* Action Buttons */}
          <div className="flex gap-3 mb-4 no-print">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print Report
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>

          {/* Receipt */}
          <div className="bg-white rounded-lg shadow-lg border-2 border-gray-200 p-8 max-w-4xl mx-auto print-section">
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
                    Generated: {new Date().toLocaleDateString()}
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
                  {reportData.stationName}
                </p>
                <p className="text-gray-600 text-sm">
                  Code: {reportData.stationCode}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Report Period
                </h4>
                <p className="text-gray-900">
                  From: {new Date(reportData.startDate).toLocaleDateString()}
                </p>
                <p className="text-gray-900">
                  To: {new Date(reportData.endDate).toLocaleDateString()}
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
                      {reportData.totalRegisteredCitizens}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 text-gray-900">
                      Total Order Cards
                    </td>
                    <td className="py-3 px-4 text-right text-gray-900 font-medium">
                      {reportData.totalOrderCards}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 text-gray-900 pl-8">
                      • Pending Cards
                    </td>
                    <td className="py-3 px-4 text-right text-orange-600 font-medium">
                      {reportData.pendingCards}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 text-gray-900 pl-8">
                      • Approved Cards
                    </td>
                    <td className="py-3 px-4 text-right text-green-600 font-medium">
                      {reportData.approvedCards}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-3 px-4 text-gray-900 pl-8">
                      • Rejected Cards
                    </td>
                    <td className="py-3 px-4 text-right text-red-600 font-medium">
                      {reportData.rejectedCards}
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
                  ${reportData.totalRevenue.toFixed(2)}
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
          </div>
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
