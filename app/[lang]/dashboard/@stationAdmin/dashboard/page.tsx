import React from "react";
import StationAdminDashboardUI from "@/features/home/components/station-admin-dashboard-ui";
import { getDashboardData } from "@/actions/stationAdmin/dashboard";

async function Page() {
  const data = await getDashboardData();

  return <StationAdminDashboardUI data={data} />;
}

export default Page;
