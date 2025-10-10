import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import StationUserListing from "@/features/stations/components/station-user-listing";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import PageContainer from "@/components/layout/page-container";

export const metadata = {
  title: "Dashboard: Station Users",
};

type pageProps = {
  params: Promise<{ stationId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page(props: pageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="Station Users"
            description="Manage users for this station and their permissions."
          />
          <Link
            href={`/dashboard/station/${params.stationId}/user/new`}
            className={cn(buttonVariants(), "text-xs md:text-sm")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New User
          </Link>
        </div>
        <Separator />
        <Suspense
          fallback={
            <DataTableSkeleton columnCount={6} rowCount={8} filterCount={2} />
          }
        >
          <StationUserListing stationId={params.stationId} />
        </Suspense>
      </div>
    </PageContainer>
  );
}
