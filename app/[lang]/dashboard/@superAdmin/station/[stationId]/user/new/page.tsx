import PageContainer from "@/components/layout/page-container";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";
import FormCardSkeleton from "@/components/form-card-skeleton";
import StationUserCreatePage from "@/features/stations/components/station-user-create-page";

export const metadata = {
  title: "Dashboard: Add Station User",
};

type PageProps = {
  params: Promise<{ stationId: string }>;
};

export default async function Page(props: PageProps) {
  const params = await props.params;

  return (
    <PageContainer scrollable>
      <div className="flex-1 space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="Add New User"
            description="Create a new user for this station"
          />
        </div>
        <Separator />
        <Suspense fallback={<FormCardSkeleton />}>
          <StationUserCreatePage stationId={params.stationId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
