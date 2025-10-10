import React from "react";

import DashboardHeader from "./components/DashboardHeader";
import SummaryCards from "./components/SummaryCards";
import SalesByHourChart from "./components/SalesByHourChart";
import PaymentMethodsChart from "./components/PaymentMethodsChart";
import PaymentMethodsPieChart from "./components/PaymentMethodsPieChart";
import RecentActivities from "./components/RecentActivities";

function Page() {
  return (
    <div className="p-4 md:p-6 space-y-6 overflow-y-auto">
      <DashboardHeader
        title="Super Admin Dashboard"
        subtitle="Overview of ID card system performance"
      />

      <SummaryCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SalesByHourChart />
        </div>
        <div className="space-y-6">
          <PaymentMethodsChart />
        </div>
      </div>

      {/* Pie Chart and Recent Activities Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <PaymentMethodsPieChart height={350} />
        </div>
        <div>
          <RecentActivities maxHeight={350} />
        </div>
      </div>
    </div>
  );
}

export default Page;
