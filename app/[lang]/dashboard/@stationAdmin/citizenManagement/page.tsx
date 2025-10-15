import React from "react";
import CitizenManagementUI from "@/features/citizen/components/citizen-management-ui";
import { getCitizens } from "@/actions/stationAdmin/citizen";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    page?: string;
    rows?: string;
  }>;
}

export default async function CitizenManagementPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const search = params.search || "";
  const currentPage = Number(params.page) || 1;
  const rows = Number(params.rows) || 10;

  const data = await getCitizens({
    search,
    currentPage,
    row: rows,
    sort: true,
  });

  return (
    <CitizenManagementUI
      initialCitizens={data.citizens}
      totalCount={data.totalCount}
      totalPages={data.totalPages}
      currentPage={currentPage}
    />
  );
}
