import React from "react";

export default function ReportPage() {
  return (
    <div className="p-4 md:p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
        <p className="text-gray-600">
          Generate and view comprehensive reports for your system
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Available Reports
        </h2>
        <p className="text-gray-600">
          Select a report type to view detailed analytics and data.
        </p>
      </div>
    </div>
  );
}
