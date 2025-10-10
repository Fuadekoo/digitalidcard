import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTableSkeleton } from "@/components/ui/table/data-table-skeleton";
import UserListing from "@/features/users/components/user-listing";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import PageContainer from "@/components/layout/page-container";

export const metadata = {
  title: "Dashboard: Users",
};

export default function Page() {
  return (
    <PageContainer scrollable={false}>
      <div className="flex flex-1 flex-col space-y-4">
        <div className="flex items-start justify-between">
          <Heading
            title="Users"
            description="Manage system users and their permissions."
          />
          <Link
            href="/dashboard/user/new"
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
          <UserListing />
        </Suspense>
      </div>
    </PageContainer>
  );
}
