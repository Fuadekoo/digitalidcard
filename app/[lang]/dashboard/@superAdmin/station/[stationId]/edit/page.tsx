import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import StationEditPage from "@/features/stations/components/station-edit-page";
import { Suspense } from "react";

export const metadata = {
  title: "Dashboard: Edit Station",
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
            title="Edit Station"
            description="Update station information and settings"
          />
        </div>
        <Separator />
        <Suspense fallback={<div>Loading station data...</div>}>
          <StationEditPage stationId={params.stationId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
