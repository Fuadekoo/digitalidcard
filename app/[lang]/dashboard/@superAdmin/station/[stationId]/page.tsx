import FormCardSkeleton from "@/components/form-card-skeleton";
import PageContainer from "@/components/layout/page-container";
import { Suspense } from "react";
import StationViewPage from "@/features/stations/components/station-view-page";

export const metadata = {
  title: "Dashboard : Station View",
};

type PageProps = { params: Promise<{ stationId: string }> };

export default async function Page(props: PageProps) {
  const params = await props.params;
  return (
    <PageContainer scrollable>
      <div className="flex-1 space-y-4">
        <Suspense fallback={<FormCardSkeleton />}>
          <StationViewPage stationId={params.stationId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
