import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import StationReportPage from "@/features/stations/components/station-report-page";
import { Suspense } from "react";

export const metadata = {
  title: "Dashboard: Station Reports",
};

type PageProps = {
  params: Promise<{ stationId: string }>;
};

export default async function Page(props: PageProps) {
  const params = await props.params;

  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="Station Reports"
            description="View comprehensive reports and statistics for this station"
          />
        </div>
        <Separator />
        <Suspense fallback={<div>Loading reports...</div>}>
          <StationReportPage stationId={params.stationId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
